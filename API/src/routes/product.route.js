import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  listProducts
} from "../controller/product.controller.js";

const router = express.Router();
import { upload } from "../middleware/upload.js";

//router.post("/", protect, adminOnly(["superadmin"]), createProduct);

router.post("/",upload.array("images",5),  createProduct);


router.get("/:id", getProduct);
router.get("/",  listProducts);
router.put("/:id",upload.array("images",5),  updateProduct);
router.delete("/delete/:id",  deleteProduct);
//router.get("/", protect, listProducts);

export default router;
