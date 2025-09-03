import mongoose from "mongoose";

const { Schema } = mongoose;

export const PROMO_TYPES = ["PERCENT", "FIXED", "BOGO"]; // Buy X get Y free/discounted
export const PROMO_STATUS = ["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"];

const PromotionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    type: { type: String, enum: PROMO_TYPES, required: true },
    // For PERCENT/FIXED
    value: { type: Number, min: 0, default: 0 }, 
  
    bogo: {
      buyQty: { type: Number, min: 1, default: 1 },
      getQty: { type: Number, min: 1, default: 1 },
     
      freeSameItem: { type: Boolean, default: true },
      getProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }], 
    },

    
    scope: {
      allBranches: { type: Boolean, default: true },
      branches: [{ type: Schema.Types.ObjectId, ref: "Branch" }], 
      products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    },

  
    minOrderAmount: { type: Number, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    stackable: { type: Boolean, default: false },
    couponCode: { type: String, uppercase: true, trim: true },

  
    usageLimitTotal: { type: Number, min: 0 },     
    usageLimitPerUser: { type: Number, min: 0 },   
    usedCountTotal: { type: Number, default: 0 },
    usedCountByUser: {
      type: Map,
      of: Number, 
      default: {},
    },


    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    status: { type: String, enum: PROMO_STATUS, default: "DRAFT" },

   
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);


PromotionSchema.index({ status: 1, startAt: 1, endAt: 1 });
PromotionSchema.index({ couponCode: 1 }, { unique: false, sparse: true });

export default mongoose.model("Promotion", PromotionSchema);
