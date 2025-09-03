
import express from "express";
import { salesReport, lowStockAlerts, exportSalesReport } from "../controller/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// router.get("/sales", protect, salesReport);
// router.get("/low-stock", protect, lowStockAlerts);
// router.get("/sales/export", protect, exportSalesReport);


router.get("/sales",  salesReport);
router.get("/low-stock", lowStockAlerts);
router.get("/sales/export",  exportSalesReport);



export default router;
