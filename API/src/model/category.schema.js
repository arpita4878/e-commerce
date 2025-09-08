import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
    },
  },
  { _id: true } 
);



const categorySchema = new mongoose.Schema(
  {
  
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    isSubCategory: {
      type: Boolean,
      default: false,
    },
    subCategories: [subCategorySchema],
    isGramBased: {
      type: Boolean,
      default: false,
    },
    isInList: {
      type: Boolean,
      default: true,
    },
    categoryImage: {
      type: String, // store image URL or file path
    },
  },
  { timestamps: true }
);


categorySchema.pre("validate", function (next) {
  if (this.isSubCategory && (!this.subCategories || this.subCategories.length === 0)) {
    this.invalidate("subCategories", "At least one subcategory is required if isSubCategory is true");
  }
  if (!this.isSubCategory && this.subCategories && this.subCategories.length > 0) {
    this.invalidate("subCategories", "Subcategories should be empty if isSubCategory is false");
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
    