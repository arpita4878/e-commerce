import mongoose from "mongoose";

const distanceBandSchema = new mongoose.Schema(
  {
    fromKm: { type: Number, required: true, min: 0 },
    toKm: { type: Number, required: true, min: 0 },
    fee: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const deliveryZoneSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true
    },
    name: { type: String, default: "Default Zone" },
    isActive: { type: Boolean, default: true },

 
    pricing: {
      type: {
        type: String,
        enum: ["flat", "per_km", "bands"],
        default: "per_km"
      },
      baseFee: { type: Number, default: 0 }, 
      perKmFee: { type: Number, default: 0 }, 
      bands: { type: [distanceBandSchema], default: [] } 
    },

    minOrderValue: { type: Number, default: 0 }, 
    etaMinutes: { type: Number, default: 45 } 
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryZone", deliveryZoneSchema);
