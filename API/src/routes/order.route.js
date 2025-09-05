import { Router } from "express";
import {
  listOrders,
  createOrder,
  assignDelivery,
  updateOrderStatus,
  cancelOrderByCustomer,
  confirmDelivery,
  trackOrder,
  listNewOrders,
  listUnderProcessOrders,
  deliveredOrder,
  pendingConfirmOrders,
  reportMissingProducts,
  deliveredOrdersWithMissingProducts,
  cancelledOrders,
  listGoneForDeliveryOrders,
  getOrderByUserAndId,
  getOrdersByUser
} from "../controller/order.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listOrders);

router.post("/", protect,createOrder);

router.post("/:id/report-missing", reportMissingProducts);

router.post("/:id/cancel-order",protect, cancelOrderByCustomer);


router.get("/user/:userId", getOrdersByUser);


router.get("/user/:userId/order/:orderId", getOrderByUserAndId);


//delivery boy
router.put("/:id/assign", assignDelivery);

router.get("/:id/trackOrder", trackOrder);

router.put("/:id/status", updateOrderStatus);

router.put("/:id/confirm", confirmDelivery);

//admin
router.get("/new",listNewOrders)

router.get("/under-process",listUnderProcessOrders)

router.get("/out-for-delivery",listGoneForDeliveryOrders)

router.get("/delivered",deliveredOrder)

router.get("/pending-confirm",pendingConfirmOrders)

router.get("/delivered-missing",deliveredOrdersWithMissingProducts)

router.get("/cancel-order",cancelledOrders)

export default router;
