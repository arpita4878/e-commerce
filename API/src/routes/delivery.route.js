// import { Router } from "express";
// import { getDeliveryQuote } from "../controller/deliveryZone.controller.js";
// const router = Router();

// router.post("/quote", getDeliveryQuote);    
// export default router;


import express from "express";
import {
    createDeliveryZone,
    getDeliveryZones,
    updateDeliveryZone,
    deleteDeliveryZone
} from "../controller/deliveryZone.controller.js";

const router = express.Router();

router.post("/", createDeliveryZone);

router.get("/", getDeliveryZones);

router.put("/:id", updateDeliveryZone);

router.delete("/:id", deleteDeliveryZone);


export default router;
