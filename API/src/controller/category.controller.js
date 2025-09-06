import Category from "../model/category.schema.js";
import fs from 'fs'

export const createCategory = async (req, res) => {
  try {
    let { categoryName, isSubCategory, subCategories, isGramBased, isInList } = req.body;

    isSubCategory = isSubCategory === "true" || isSubCategory === true;
    isGramBased   = isGramBased === "true" || isGramBased === true;
    isInList      = isInList === "true" || isInList === true;

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

 
    let categoryImage = null;
    if (req.file) {
      categoryImage = req.file.path;
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



export const updateCategory = async (req, res) => {
  try {
    const { isSubCategory, subCategories } = req.body;

    
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

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

   
    if (req.file) {
      // delete old image if exists
      if (category.categoryImage && fs.existsSync(category.categoryImage)) {
        fs.unlinkSync(category.categoryImage);
      }
      req.body.categoryImage = req.file.path; 
    }

   
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
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
