import Product from "../model/product.schema.js";
import Inventory from "../model/inventory.js";
import fs from 'fs'
export const createProduct = async (req, res) => {
  try {
    // req.files is an array of files
    const images = req.files?.map(f => f.path) || [];

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    
    const product_details = {
      productName: req.body.productName,
      barcode: req.body.barcode,
      brandId: req.body.brandId,
      categoryId: req.body.categoryId,
      description: req.body.description,
      basePrice: req.body.basePrice,
      quantity: req.body.quantity,
      attributes: req.body.attributes,
      images: images.length > 0 ? images : req.body.images || [],
      info: new Date(),
      keywords: req.body.keywords?.split(",") || [], // handle comma-separated
      storeId: Array.isArray(req.body.storeId) ? req.body.storeId : [req.body.storeId],
      stock: req.body.stock,
      display: req.body.display
    };

    const product = await Product.create(product_details);
    res.status(201).json(product);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let images = product.images || [];
    if (req.files?.length > 0) {
      images = [...images, ...req.files.map(f => f.path)];
    }

    let attributes = req.body.attributes;
    if (typeof attributes === "string") {
      try {
        attributes = JSON.parse(attributes); 
      } catch {
        attributes = {}; 
      }
    }
    if (Array.isArray(attributes)) {
      attributes = Object.fromEntries(attributes.map((v, i) => [`attr${i + 1}`, v]));
    }

    const updateData = {
      ...req.body,
      images,
      attributes, 
    };

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);

  } catch (e) {
    console.error("Update product error:", e);
    res.status(400).json({ message: e.message });
  }
};



export const deleteProduct = async (req, res) => {
  try {
    const prod = await Product.findByIdAndDelete(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    await Inventory.deleteMany({ productId: prod._id });
    res.json({ message: "Deleted product and related inventory" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const getProduct = async (req, res) => {
  try {
    const { branchId } = req.query;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    let branchInventory = null;
    if (branchId) {
      branchInventory = await Inventory.findOne({ productId: product._id, branchId });
    }
    res.json({ product, branchInventory });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};



export const listProducts = async (req, res) => {
  try {
    const {
      q,              
      category,
      brand,
      isActive,
      branchId,       
      page = 1,
      limit = 20,
      sort = "-createdAt" 
    } = req.query;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

   
    const pipeline = [
      { $match: filter },
      ...(branchId ? [
      
        { $lookup: {
            from: "inventories",
            let: { pid: "$_id" },
            pipeline: [
              { $match: { $expr: { $and: [ { $eq: ["$productId", "$$pid"] }, { $eq: ["$branchId", new require("mongoose").Types.ObjectId(branchId)] } ] } } },
              { $project: { price: 1, quantity: 1, lowStockThreshold: 1 } }
            ],
            as: "inventory"
          }
        },
        { $addFields: { inventory: { $arrayElemAt: ["$inventory", 0] } } }
      ] : []), 
      { $sort: (() => {
        
          const dir = sort?.startsWith("-") ? -1 : 1;
          const field = sort?.replace(/^-/, "") || "createdAt";
          return { [branchId && field === "price" ? "inventory.price" : field]: dir };
      })() },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    const [items, total] = await Promise.all([
      Product.aggregate(pipeline),
      Product.countDocuments(filter),
    ]);

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      items
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
