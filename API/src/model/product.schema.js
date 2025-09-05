import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    brand: { type: String, index: true },
    category: { type: String, index: true },
    attributes: { type: Map, of: String }, // e.g. color:size
    isActive: { type: Boolean, default: true },
    basePrice: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    images: [{ type: String }], // Array of image URLs
    keywords: [{ type: String, index: true }], 
     brandId: { type: Number, required: true },
  },
  { timestamps: true }
);

productSchema.index({
  name: "text",
  sku: "text",
  brand: "text",
  category: "text",
  description: "text",
  keywords:"text",
  
});

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;
