import Category from "../model/category.schema.js";

import mongoose from "mongoose";


export const addSubCategory = async (req, res) => {
  try {
    const { id } = req.params; 
    const { subCategoryName } = req.body;

    if (!subCategoryName) {
      return res.status(400).json({ status: false, message: "Subcategory name is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

    category.subCategories.push({ name: subCategoryName });
    await category.save();

    res.status(200).json({
      status: true,
      message: "Subcategory added successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const editSubCategory = async (req, res) => {
  try {
    const { id, subCategoryId } = req.params; // both from URL
    const { newName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid category ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return res.status(400).json({ status: false, message: "Invalid subcategory ID" });
    }
    if (!newName || newName.trim() === "") {
      return res.status(400).json({ status: false, message: "New subcategory name is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ status: false, message: "Subcategory not found" });
    }

    subCategory.name = newName.trim();
    await category.save();

    res.status(200).json({
      status: true,
      message: "Subcategory updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};




export const deleteSubCategory = async (req, res) => {
  try {
    const { id, subCategoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid category ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return res.status(400).json({ status: false, message: "Invalid subcategory ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ status: false, message: "Subcategory not found" });
    }

category.subCategories.pull({ _id: subCategoryId });
    await category.save();

    res.status(200).json({
      status: true,
      message: "Subcategory deleted successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
