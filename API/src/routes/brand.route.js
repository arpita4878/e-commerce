import express from "express";
import multer from "multer";
import { createBrand, getBrands,getBrandById, deleteBrand, getBrandWithProducts,updateBrand } from "../controller/brand.controller.js";

const router = express.Router();

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/brands/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), createBrand);
router.get("/", getBrands);
router.get("/:id", getBrandById);
router.get("/:id/products", getBrandWithProducts);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);

export default router;
