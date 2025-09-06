import express from "express";
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,

} from "../controller/category.controller.js";

import { upload } from "../middleware/upload.js";

import {
    addSubCategory,
    editSubCategory,
    deleteSubCategory,
} from '../controller/subCategory.js'

const router = express.Router();

router.post("/",upload.single("categoryImage"),  createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id",upload.single("categoryImage"),  updateCategory);
router.delete("/:id", deleteCategory);


router.post("/:id/subcategories", addSubCategory);
router.put("/:id/subcategories/:subCategoryId", editSubCategory);
router.delete("/:id/subcategories/:subCategoryId", deleteSubCategory);

export default router;
