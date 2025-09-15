import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  listProducts
} from "../controller/product.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";


const router = express.Router();
import { upload } from "../middleware/upload.js";

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Upload product details with up to 5 images
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *                 example: "Apple Juice"
 *               barcode:
 *                 type: string
 *                 example: "1234567890"
 *               brandId:
 *                 type: string
 *                 example: "1"
 *               categoryId:
 *                 type: string
 *                 example: "2"
 *               description:
 *                 type: string
 *                 example: "Fresh apple juice"
 *               basePrice:
 *                 type: number
 *                 example: 150
 *               quantity:
 *                 type: string
 *                 example: "150gm"
 *               attributes:
 *                 type: string
 *                 example: "Organic"
 *               keywords:
 *                 type: string
 *                 example: "juice,fresh"
 *               storeId:
 *                 type: string
 *                 example: "1"
 *               stock:
 *                 type: integer
 *                 example: 15
 *               display:
 *                 type: boolean
 *                 example: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 5 images
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product created successfully"
 *                 data:
 *                   type: object
 */
router.post("/", protect,    
  adminOnly(["super_admin"]),upload.array("images", 5), createProduct);



router.get("/:id", getProduct);
router.get("/",  listProducts);
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     description: Update product details with optional new images
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: Product ID
 *       - in: formData
 *         name: productName
 *         type: string
 *       - in: formData
 *         name: barcode
 *         type: string
 *       - in: formData
 *         name: brandId
 *         type: string
 *       - in: formData
 *         name: categoryId
 *         type: string
 *       - in: formData
 *         name: description
 *         type: string
 *       - in: formData
 *         name: basePrice
 *         type: number
 *       - in: formData
 *         name: quantity
 *         type: number
 *       - in: formData
 *         name: attributes
 *         type: string
 *       - in: formData
 *         name: keywords
 *         type: string
 *       - in: formData
 *         name: storeId
 *         type: string
 *       - in: formData
 *         name: stock
 *         type: number
 *       - in: formData
 *         name: display
 *         type: boolean
 *       - in: formData
 *         name: images
 *         type: file
 *         description: Upload up to 5 images
 *         required: false
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put("/:id", upload.array("images", 5), updateProduct);

router.delete("/delete/:id",  deleteProduct);
//router.get("/", protect, listProducts);

export default router;
