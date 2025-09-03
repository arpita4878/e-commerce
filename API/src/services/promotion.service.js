import Promotion from "../model/promotion.schema.js";
import mongoose from "mongoose";

/**
 * cart = {
 *   items: [{ productId, categoryId, price, qty }],
 *   subtotal, userId, branchId, couponCode (optional)
 * }
 */
export async function findActivePromotions({ branchId, now = new Date(), couponCode }) {
  const q = {
    status: "ACTIVE",
    startAt: { $lte: now },
    endAt: { $gte: now },
  };
  if (couponCode) q.couponCode = couponCode.toUpperCase();

  const promos = await Promotion.find(q).lean();
  return promos.filter(p => {
    if (!p.scope?.allBranches && p.scope?.branches?.length > 0) {
      return p.scope.branches.map(String).includes(String(branchId));
    }
    return true;
  });
}

function itemInScope(item, promo) {
  const { products = [], categories = [] } = promo.scope || {};
  if (products?.length && !products.map(String).includes(String(item.productId))) return false;
  if (categories?.length && !categories.map(String).includes(String(item.categoryId))) return false;
  return true;
}

function cartMeetsRules(cart, promo) {
  if (promo.minOrderAmount && cart.subtotal < promo.minOrderAmount) return false;

  // usage limits are enforced at apply time (in DB), but we can pre-check here if needed
  return true;
}

function calcPercentDiscount(amount, percent) {
  return Math.max(0, (amount * percent) / 100);
}

function calcFixedDiscount(amount, fixed) {
  return Math.min(amount, fixed);
}

function capMax(discount, max) {
  if (!max || max <= 0) return discount;
  return Math.min(discount, max);
}

function applyPercentOrFixed(cart, promo) {
  // Apply on scoped items; if no scope products/categories, apply on whole cart
  const applicableItems = cart.items.filter(i => itemInScope(i, promo));
  const baseAmount = applicableItems.length
    ? applicableItems.reduce((s, i) => s + i.price * i.qty, 0)
    : cart.subtotal;

  let discount = 0;
  if (promo.type === "PERCENT") discount = calcPercentDiscount(baseAmount, promo.value);
  if (promo.type === "FIXED") discount = calcFixedDiscount(baseAmount, promo.value);

  discount = capMax(discount, promo.maxDiscountAmount);

  return { discount, details: { baseAmount } };
}

function applyBOGO(cart, promo) {
  const { buyQty = 1, getQty = 1, freeSameItem = true, getProducts = [] } = promo.bogo || {};
  let discount = 0;

  const applicableItems = cart.items.filter(i => itemInScope(i, promo));
  if (!applicableItems.length) return { discount, details: {} };

  if (freeSameItem) {
    for (const item of applicableItems) {
      const group = Math.floor(item.qty / (buyQty + getQty));
      const freeUnits = group * getQty;
      discount += freeUnits * item.price;
    }
  } else {
    // Buy qualifying items, discount cheapest from "getProducts" (or same scope) for each set
    const totalBuyQty = applicableItems.reduce((s, i) => s + i.qty, 0);
    const sets = Math.floor(totalBuyQty / buyQty);
    const eligibleTargets = cart.items.filter(i =>
      getProducts?.length ? getProducts.map(String).includes(String(i.productId)) : itemInScope(i, promo)
    );
    // discount the cheapest `getQty * sets` units
    const unitPrices = [];
    eligibleTargets.forEach(i => {
      for (let k = 0; k < i.qty; k++) unitPrices.push(i.price);
    });
    unitPrices.sort((a, b) => a - b);
    const freeUnits = Math.min(unitPrices.length, getQty * sets);
    for (let i = 0; i < freeUnits; i++) discount += unitPrices[i];
  }

  discount = capMax(discount, promo.maxDiscountAmount);
  return { discount, details: {} };
}

export async function priceWithPromotions(cart, opts = {}) {
  const { branchId, userId, now = new Date() } = cart;
  const promos = await findActivePromotions({ branchId, now, couponCode: cart.couponCode });

  const candidates = [];

  for (const promo of promos) {
    if (!cartMeetsRules(cart, promo)) continue;

    let result = { discount: 0, details: {} };
    if (promo.type === "PERCENT" || promo.type === "FIXED") {
      result = applyPercentOrFixed(cart, promo);
    } else if (promo.type === "BOGO") {
      result = applyBOGO(cart, promo);
    }

    if (result.discount > 0) {
      candidates.push({
        promo,
        discount: result.discount,
        details: result.details,
      });
    }
  }

  // If any promo is not stackable, pick the best single discount among non-stackable ones
  const stackable = candidates.filter(c => c.promo.stackable);
  const nonStack = candidates.filter(c => !c.promo.stackable);

  let applied = [];
  if (nonStack.length) {
    const best = nonStack.reduce((max, c) => (c.discount > max.discount ? c : max), nonStack[0]);
    applied.push(best);
  }
  // Add stackable on top
  applied = applied.concat(stackable);

  const totalDiscount = applied.reduce((s, a) => s + a.discount, 0);
  const payable = Math.max(0, cart.subtotal - totalDiscount);

  return {
    subtotal: cart.subtotal,
    discount: totalDiscount,
    payable,
    appliedPromotions: applied.map(a => ({
      id: a.promo._id,
      name: a.promo.name,
      type: a.promo.type,
      value: a.promo.value,
      couponCode: a.promo.couponCode,
      discount: a.discount,
    })),
  };
}

/** Call on successful order placement to track usage */
export async function commitPromotionUsage({ userId, appliedPromotions }) {
  if (!appliedPromotions?.length) return;
  const ops = appliedPromotions.map(ap =>
    ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(ap.id) },
        update: {
          $inc: { usedCountTotal: 1, [`usedCountByUser.${userId}`]: 1 }
        }
      }
    })
  );
  await Promotion.bulkWrite(ops, { ordered: false });
}
