import { Router } from "express";
import {
    createBranch,
    listBranches,
    updateBranch,
    deleteBranch
} from "../controller/branch.controller.js";

const router = Router();
router.post("/", createBranch);
router.get("/", listBranches);
router.put("/:id", updateBranch);
router.delete("/:id", deleteBranch);
export default router;

