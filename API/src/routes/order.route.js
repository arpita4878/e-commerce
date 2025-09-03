import { Router } from "express";
import {
  listOrders,
  createOrder,
  assignDelivery,
  updateOrderStatus,
  confirmDelivery,
  trackOrder
} from "../controller/order.controller.js";

const router = Router();

router.get("/", listOrders);

router.post("/", createOrder);

router.put("/:id/assign", assignDelivery);

router.get("/:id/trackOrder", trackOrder);

router.put("/:id/status", updateOrderStatus);

router.put("/:id/confirm", confirmDelivery);

export default router;
