import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  address: { type: String },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0,0] } // [lng, lat]
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

branchSchema.index({ location: "2dsphere" });

export default mongoose.model("Branch", branchSchema);
