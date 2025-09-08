import Category from "../model/category.schema.js";
import fs from 'fs'

export const createCategory = async (req, res) => {
  try {
    let { categoryName, isSubCategory, subCategories, isGramBased, isInList } = req.body;

   
    isSubCategory = isSubCategory === "true" || isSubCategory === true;
    isGramBased   = isGramBased === "true" || isGramBased === true;
    isInList      = isInList === "true" || isInList === true;

    if (typeof subCategories === "string") {
      try {
        subCategories = JSON.parse(subCategories);
      } catch (err) {
        return res.status(400).json({
          status: false,
          message: "Invalid subCategories format. Must be valid JSON array.",
        });
      }
    } 
   
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




export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ status: true, data: categories });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


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
    let { isSubCategory, subCategories, isGramBased, isInList } = req.body;

    // Convert string booleans to real booleans
    isSubCategory = isSubCategory === "true" || isSubCategory === true;
    isGramBased   = isGramBased === "true" || isGramBased === true;
    isInList      = isInList === "true" || isInList === true;

    // Parse subCategories if it's a string
    if (subCategories && typeof subCategories === "string") {
      try {
        subCategories = JSON.parse(subCategories);
      } catch (err) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid subCategories format. Must be JSON array.",
                });
            }
      }
    

    // Validation rules
    if (isSubCategory && (!subCategories || subCategories.length === 0)) {
      return res.status(400).json({
        status: false,
        message:
          "At least one subcategory is required when 'isSubCategory' is true",
      });
    }

    if (!isSubCategory && subCategories && subCategories.length > 0) {
      return res.status(400).json({
        status: false,
        message:
          "Subcategories should not be added when 'isSubCategory' is false",
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }

    // Replace image if a new one is uploaded
    if (req.file) {
      if (category.categoryImage && fs.existsSync(category.categoryImage)) {
        fs.unlinkSync(category.categoryImage);
      }
      req.body.categoryImage = req.file.path;
    }

    // Perform update
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        categoryName: req.body.categoryName ?? category.categoryName,
        isSubCategory,
        isGramBased,
        isInList,
        subCategories: subCategories || [],
        categoryImage: req.body.categoryImage ?? category.categoryImage,
      },
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






export const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ status: false, message: "Category not found" });

    res.status(200).json({ status: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
