import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  _id: Number,
  brandName: { type: String, required: true, unique: true, trim: true },
  isInList: { type: Boolean, default: true,required:true },
  image: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("Brand", brandSchema);
