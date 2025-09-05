import Order from "../model/order.schema.js";
import User from "../model/user.schema.js";
import Inventory from "../model/inventory.js";
import DeliveryZone from "../model/deliveryZone.schema.js";
import Branch from "../model/branch.schema.js";
import { haversineKm } from "../lib/geo.js";



export async function createOrder(req, res, next) {
  try {
    const { branch, items, customer, payment } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: login required" });
    }

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

    const distanceKm = haversineKm(branchDoc.location.coordinates, customer.location.coordinates);

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
      customerId: req.user._id,     // link to logged-in user
      customer: {
        customerId: customer.customerId,
        name: customer.name || req.user.name,
        phone: customer.phone || req.user.phone,
        address: customer.address,
        location: customer.location
      },
      payment,
      delivery: {
        zoneId: zone._id,
        fee: deliveryFee,
        etaMinutes: zone.etaMinutes
      },
      delivery_boy: {
        id: null,
        name: null,
        phone: null
      }
    });

    // --- update user stats ---
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { orderCount: 1, totalOrderAmount: total },
      $set: { lastOrderDate: new Date() }
    });

    // Notify branch in real-time
    global._io.to(String(branch)).emit("newOrder", {
      orderId: order._id,
      status: order.status,
      items: order.items,
      total: order.total,
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
      .populate("delivery_boy", "name phone")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}



export async function getOrdersByUser(req, res, next) {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ "customer.customerId": userId })
      .populate("branch", "name")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 })
      .lean();

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

  
export async function getOrderByUserAndId(req, res, next) {
  try {
    const { userId, orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      "customer.customerId": userId
    })
      .populate("branch", "name")
      .populate("items.productId", "name price")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found for this user" });
    }

    res.json({ order });
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
      delivery_boy: order.delivery_boy,
      assignedAt: order.assignedAt,
      deliveredAt: order.deliveredAt
    });
  } catch (err) {
    next(err);
  }
}




export async function reportMissingProducts(req, res, next) {
  try {
    const { orderId } = req.params;
    const { missingProducts } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Customer can only report missing products after delivery" });
    }

    order.customerMissingProducts.push(...missingProducts);
    await order.save();

    res.json({ message: "Missing products reported", order });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrderByCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id; 

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customer.customerId !== userId) {
      return res.status(403).json({ message: "You can only cancel your own orders" });
    }

    // Prevent cancel if already delivered or cancelled
    if (["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({ message: `Order already ${order.status}` });
    }

    // Cancel the order
    order.status = "cancelled";
    order.cancelledBy = userId;
    order.cancelledAt = new Date();
    if (reason) order.cancelReason = reason;

    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    next(err);
  }
}

//delivery boy

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


    global._io.to(String(order.branch)).emit("deliveryAssigned", {
      orderId: order._id,
      delivery_boy: order.delivery_boy,
    });


    global._io.to(`delivery_${user._id}`).emit("assignedOrder", {
      orderId: order._id,
      customer: order.customer,
      items: order.items,
    });

    res.json({ message: "Order assigned successfully", order });
  } catch (err) {
    next(err);
  }
}




export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "paid", "pending_confirm", "under_process", "packed", "out_for_delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      const e = new Error("Invalid status");
      e.status = 400;
      throw e;
    }

    const update = { status };
    if (status === "delivered") {
      update.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!order) {
      const e = new Error("Order not found");
      e.status = 404;
      throw e;
    }

    //  Notify branch
    global._io.to(String(order.branch)).emit("orderStatusUpdate", {
      orderId: order._id,
      status: order.status,
    });

    // Notify delivery boy
    if (order.delivery_boy?.id) {
      global._io.to(`delivery_${order.delivery_boy.id}`).emit("orderStatusUpdate", {
        orderId: order._id,
        status: order.status,
      });
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


//admin


export async function listNewOrders(req, res, next) {
  try {
    const { branch, limit } = req.query;
    const q = { status: "new" };

    if (branch) q.branch = branch;

    const orders = await Order.find(q)
      .populate("branch", "name")
      .populate("items.productId", "name price")
      .populate("delivery_boy", "name phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 10)
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}



export async function listUnderProcessOrders(req, res, next) {
  try {
    const { branch, limit } = req.query;
    const q = { status: "under_process" };

    if (branch) q.branch = branch;

    const orders = await Order.find(q)
      .populate("branch", "name")
      .populate("items.productId", "name price")
      .populate("delivery_boy", "name phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 10)
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}


export async function listGoneForDeliveryOrders(req, res, next) {
  try {
    const { branch, limit } = req.query;
    const q = { status: "out_for_delivery" };

    if (branch) q.branch = branch;

    const orders = await Order.find(q)
      .populate("branch", "name")
      .populate("items.productId", "name price")
      .populate("delivery_boy", "name phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 10)
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}


export async function deliveredOrder(req, res, next) {
  try {
    const { branch, limit } = req.query;
    const q = { status: "delivered" };

    if (branch) q.branch = branch;

    const orders = await Order.find(q)
      .populate("branch", "name")
      .populate("items.productId", "name price")
      .populate("delivery_boy", "name phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 10)
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}




export async function pendingConfirmOrders(req, res, next) {
  try {
    const { branch, limit } = req.query;
    const q = { status: "pending_confirm" };

    if (branch) q.branch = branch;

    const orders = await Order.find(q)
      .populate("branch", "name")
      .populate("items.productId", "name price")
      .populate("delivery_boy", "name phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 10)
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function deliveredOrdersWithMissingProducts(req, res, next) {
  try {
    const { branch, limit } = req.query;
    const q = { status: "delivered", isMissing: true };

    if (branch) q.branch = branch;

    const orders = await Order.find(q)
      .populate("branch", "name")
      .populate("items.productId", "name price")
      .populate("delivery_boy", "name phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 10)
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}



export async function cancelledOrders(req, res, next) {
  try {
    const { branch, limit } = req.query;
    const q = { status: "cancelled" };

    if (branch) q.branch = branch;

    const orders = await Order.find(q)
      .populate("branch", "name")
      .populate("items.productId", "name price")
      .populate("delivery_boy", "name phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 10)
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}
