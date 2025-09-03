import mongoose from "mongoose";

const branchProductSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

branchProductSchema.index({ branch: 1, product: 1 }, { unique: true });

export default mongoose.model("BranchProduct", branchProductSchema);
