import express from "express";
import {
  createBranch,
  listBranches,
  getBranch,
  updateBranch,
  deleteBranch,
  getBranchesByLocation
} from "../controller/branch.controller.js";

import {
  addStore,
  updateStore,
  deleteStore
} from "../controller/store.controller.js";

import {
  addZone,
  updateZone,
  deleteZone,
  checkDeliveryAvailability
} from "../controller/zone.controller.js";

const router = express.Router();

// Branch routes
router.post("/", createBranch); 
router.get("/", listBranches); 
router.get("/location", getBranchesByLocation);
router.get("/:id", getBranch);
router.put("/:id", updateBranch);
router.delete("/:id", deleteBranch);

// Store routes
router.post("/:branchId/stores", addStore);
router.put("/:branchId/stores/:storeId", updateStore);
router.delete("/:branchId/stores/:storeId", deleteStore);

// Zone routes
router.post("/:branchId/stores/:storeId/zones", addZone); 
router.put("/:branchId/stores/:storeId/zones/:zoneId", updateZone); 
router.delete("/:branchId/stores/:storeId/zones/:zoneId", deleteZone); 
router.post("/:branchId/stores/:storeId/check-delivery", checkDeliveryAvailability); 


export default router;
