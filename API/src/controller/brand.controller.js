import Brand from "../model/brand.schema.js";
import Product from "../model/product.schema.js";

import path from "path";
export const createBrand = async (req, res) => {
  try {
    const brands = await Brand.find();
    const _id = brands.length === 0 ? 1 : brands[brands.length - 1]._id + 1;

    const { brandName, isInList } = req.body;
    const image = req.file ? `/uploads/brands/${req.file.filename}` : null; 

    const existing = await Brand.findOne({ brandName });
    if (existing) {
      return res.status(400).json({ status: false, message: "Brand already exists" });
    }

    const brand = await Brand.create({ _id, brandName, isInList, image });
    res.status(201).json({ status: true, message: "Brand created successfully", data: brand });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



// Get all brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json({ status: true, data: brands });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


// Get brand by ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ status: false, message: "Brand not found" });
    }

    res.status(200).json({ status: true, data: brand });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


export const getBrandWithProducts = async (req, res) => {
  try {
    const brandId = parseInt(req.params.id); 
    if (isNaN(brandId)) {
      return res.status(400).json({ status: false, message: "Invalid brand ID" });
    }

    const products = await Product.find({ brandId });
    res.status(200).json({ status: true, data: products });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const updateBrand = async (req, res) => {
  try {
    const id = Number(req.params.brandId);
    if (isNaN(id)) return res.status(400).json({ status: false, message: "Invalid brand ID" });

    const { brandName, isInList, image } = req.body;

    const updated = await Brand.findOneAndUpdate(
      { _id: id },
      { brandName, isInList, image },
      { new: true }
    );

    if (!updated) return res.status(404).json({ status: false, message: "Brand not found" });

    res.status(200).json({ status: true, message: "Brand updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


export const deleteBrand = async (req, res) => {
  try {
    const id = Number(req.params.brandId);
    if (isNaN(id)) return res.status(400).json({ status: false, message: "Invalid brand ID" });

    const deleted = await Brand.findOneAndDelete({ _id: id });
    if (!deleted) return res.status(404).json({ status: false, message: "Brand not found" });

    res.status(200).json({ status: true, message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};