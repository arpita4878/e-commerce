import Category from "../model/category.schema.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { categoryName, isSubCategory, subCategories, isGramBased, isInList, categoryImage } = req.body;

    // Validation: if isSubCategory = true, subCategories must exist
    if (isSubCategory && (!subCategories || subCategories.length === 0)) {
      return res.status(400).json({
        status: false,
        message: "At least one subcategory is required when 'isSubCategory' is true",
      });
    }

    // Validation: if isSubCategory = false, subCategories must be empty
    if (!isSubCategory && subCategories && subCategories.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Subcategories should not be added when 'isSubCategory' is false",
      });
    }

    const newCategory = await Category.create({
    
      categoryName,
      isSubCategory,
      subCategories: subCategories || [],
      isGramBased,
      isInList,
      categoryImage,
    });

    res.status(201).json({
      status: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ status: true, data: categories });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ status: false, message: "Category not found" });

    res.status(200).json({ status: true, data: category });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { isSubCategory, subCategories } = req.body;

    // Revalidate like in create
    if (isSubCategory && (!subCategories || subCategories.length === 0)) {
      return res.status(400).json({
        status: false,
        message: "At least one subcategory is required when 'isSubCategory' is true",
      });
    }
    if (!isSubCategory && subCategories && subCategories.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Subcategories should not be added when 'isSubCategory' is false",
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCategory) return res.status(404).json({ status: false, message: "Category not found" });

    res.status(200).json({ status: true, message: "Category updated", data: updatedCategory });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ status: false, message: "Category not found" });

    res.status(200).json({ status: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
