import Order from "../model/order.schema.js";
import User from "../model/user.schema.js";
import Inventory from "../model/inventory.js";
import DeliveryZone from "../model/deliveryZone.schema.js";
import Branch from "../model/branch.schema.js";
import { haversineKm } from "../lib/geo.js";


export async function createOrder(req, res, next) {
  try {
    const { branch, items, customer, payment } = req.body;

    if (!customer?.location?.coordinates) {
      return res.status(400).json({ message: "customer.location is required (Point with [lng,lat])" });
    }

  
    let itemsTotal = 0;
    const normalized = [];

    for (const it of items) {
  const inv = await Inventory.findOne({ productId: it.productId, branchId: branch })
    .populate("productId");  
  if (!inv) return res.status(400).json({ message: "Inventory not found for product/branch" });
  if (inv.quantity < it.qty) return res.status(400).json({ message: `Insufficient stock for ${inv.productId.name}` });

  itemsTotal += inv.price * it.qty;

  normalized.push({
    productId: inv.productId._id,
    productName: inv.productId.name,   
    productCode: inv.productId.sku,    
    qty: it.qty,
    price: inv.price
  });

  inv.quantity -= it.qty;
  await inv.save();


    }

    // --- delivery fee from zone ---
    const branchDoc = await Branch.findById(branch);
    if (!branchDoc) return res.status(404).json({ message: "Branch not found" });

    const zone = await DeliveryZone.findOne({ branchId: branch, isActive: true });
    if (!zone) return res.status(400).json({ message: "No active delivery zone configured for this branch" });

    // Calculate distance
    const distanceKm = haversineKm(branchDoc.location.coordinates, customer.location.coordinates);

    // Compute fee based on pricing
    let deliveryFee = 0;
    if (zone.pricing.type === "flat") {
      deliveryFee = zone.pricing.baseFee || 0;
    } else if (zone.pricing.type === "per_km") {
      deliveryFee = (zone.pricing.baseFee || 0) + (zone.pricing.perKmFee || 0) * distanceKm;
    } else if (zone.pricing.type === "bands") {
      const band = zone.pricing.bands.find(b => distanceKm >= b.fromKm && distanceKm <= b.toKm);
      deliveryFee = band ? band.fee : (zone.pricing.baseFee || 0);
    }

    deliveryFee = Math.round(Math.max(0, deliveryFee));

    if (itemsTotal < (zone.minOrderValue || 0)) {
      return res.status(400).json({ message: `Minimum order ₹${zone.minOrderValue}` });
    }

    const total = itemsTotal + deliveryFee;

    // --- create order ---
    const order = await Order.create({
      branch,
      items: normalized,
      total,
      customer,
      payment,
      delivery: {
        zoneId: zone._id,
        fee: deliveryFee,
        etaMinutes: zone.etaMinutes
      },
      delivery_boy:{
        id:null,
        name:null,
        phone:null
      }
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}


export async function listOrders(req, res, next) {
  try {
    const { branch, status, from, to } = req.query;
    const q = {};

    if (branch) q.branch = branch;
    if (status) q.status = status;
    if (from || to) {
      q.createdAt = {
        ...(from && { $gte: new Date(from) }),
        ...(to && { $lte: new Date(to) }),
      };
    }

    const orders = await Order.find(q)
      .populate("branch", "name") 
      .populate("items.productId", "name price") 
      .populate("deliveryBoy", "name phone") 
      .sort({ createdAt: -1 })
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}


export async function assignDelivery(req, res, next) {
  try {
    const { id } = req.params; 
    const { delivery_boy } = req.body; 

 
    const user = await User.findById(delivery_boy);
    if (!user || user.role !== "delivery_boy") {
      const e = new Error("Invalid delivery boy");
      e.status = 400;
      throw e;
    }

    
    const order = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          delivery_boy: {
            id: user._id,
            name: user.name,
            email: user.email
          },
          status: "assigned",
          assignedAt: new Date()
        }
      },
      { new: true }
    ).lean();

    if (!order) {
      const e = new Error("Order not found");
      e.status = 404;
      throw e;
    }

    res.json({ message: "Order assigned successfully", order });
  } catch (err) {
    next(err);
  }
}


export async function trackOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("delivery_boy", "name phone")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      orderId: order._id,
      status: order.status,
      deliveryBoy: order.delivery_boy,
      assignedAt: order.assignedAt,
      deliveredAt: order.deliveredAt
    });
  } catch (err) {
    next(err);
  }
}


export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "paid",
      "packed",
      "out_for_delivery",
      "delivered",
      "cancelled"
    ];

    if (!validStatuses.includes(status)) {
      const e = new Error("Invalid status");
      e.status = 400;
      throw e;
    }

    const update = { status };
    if (status === "delivered") {
      update.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true })
      .populate("delivery_boy", "name phone")
      .lean();

    if (!order) {
      const e = new Error("Order not found");
      e.status = 404;
      throw e;
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
}


export async function confirmDelivery(req, res, next) {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
      id,
      { status: "delivered", deliveredAt: new Date() },
      { new: true }
    ).lean();

    if (!order) {
      const e = new Error("Order not found");
      e.status = 404;
      throw e;
    }

    res.json({ message: "Delivery confirmed", order });
  } catch (err) {
    next(err);
  }
}
