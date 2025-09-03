import mongoose from "mongoose";
const inventorySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    branchId:  { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    price:     { type: Number, required: true, min: 0 },
    quantity:  { type: Number, required: true, min: 0 },
    lowStockThreshold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Ensure one row per (product, branch)
inventorySchema.index({ productId: 1, branchId: 1 }, { unique: true });

const InventoryModel = mongoose.model("Inventory", inventorySchema);

export default InventoryModel;
