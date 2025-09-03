import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  listProducts
} from "../controller/product.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/role.middleware.js";
const router = express.Router();

//router.post("/", protect, adminOnly(["superadmin"]), createProduct);

router.post("/",createProduct);
// router.put("/:id", protect, adminOnly(["superadmin"]), updateProduct);
// router.delete("/:id", protect, adminOnly(["superadmin"]), deleteProduct);


//router.get("/:id", protect, getProduct);
router.get("/:id", getProduct);
router.get("/",  listProducts);
router.put("/update/:id",  updateProduct);
router.delete("/delete/:id",  deleteProduct);
//router.get("/", protect, listProducts);

export default router;
