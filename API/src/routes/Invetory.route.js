import express from "express";
import multer from "multer";    
import {
  upsertMyBranchInventory,
  bulkUploadForMyBranch,
  getInventoryForBranch
} from "../controller/Inventory.controller.js"
import { protect } from "../middleware/auth.middleware.js";
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post("/mine", upsertMyBranchInventory);
// router.post("/mine/bulk", protect, upload.single("file"), bulkUploadForMyBranch);


// router.get("/branch/:branchId", protect, getInventoryForBranch);
router.get("/branch/:branchId",  getInventoryForBranch);

export default router;
