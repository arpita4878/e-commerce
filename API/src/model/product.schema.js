import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, index: true },
    barcode: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    categoryId: { type: Number, required:true},
    attributes: { type: Map, of: String }, // e.g. color:size
    basePrice: { type: Number, default: 0 },
    Quantity: { type: Number, default: 0 },
    images: [{ type: String }], // Array of image 
    keywords: [{ type: String, index: true }], 
    brandId: { type: Number, required: true },
    storeId:[{type:Number, required: true }],
    stock: { type: Number, default: 0 },   
    display: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({
  name: "text",
  barcode: "text",
  brand: "text",
  category: "text",
  description: "text",
  keywords:"text",
  
});

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;
