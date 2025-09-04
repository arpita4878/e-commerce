import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String, required: true },
        productCode: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "packed",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "online",
        "returned",
        "refund_initiated",
        "refunded",
        "refund_failed",
        "refund_pending",
        "assigned",
        "under_process",
        "gone_for_delivery",
        "pending_confirm",
        "new"
      ],
      default: "new"
    },
    customer: {
      name: String,
      phone: Number,
      address: String,
      customerId: { type:Number, required: true ,ref: "User" },
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
      }
    },
    delivery: {
      zoneId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryZone" },
      fee: { type: Number, default: 0 },
      etaMinutes: { type: Number },
      route: {
        distanceMeters: Number,
        durationSeconds: Number,
        polyline: String
      }
    },
    payment: {
      method: { type: String, enum: ["cod", "online"], default: "cod" },
      paid: { type: Boolean, default: false }
    },
    customerMissingProducts: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        note: String,
        reportedAt: { type: Date, default: Date.now },
      },
    ],
    cancelledBy: { type: Number, ref: "User" },
    cancelledAt: { type: Date },
    cancelReason: { type: String },

    delivery_boy: {
      id: { type: Number },
      name: { type: String },
      email: { type: String }
    },
    assignedAt: { type: Date },
    deliveredAt: { type: Date }
  },

  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
