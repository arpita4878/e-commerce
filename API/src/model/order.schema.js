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
        "assigned"
      ],
      default: "pending"
    },
    customer: {
      name: String,
      phone: Number,
      address: String,
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
