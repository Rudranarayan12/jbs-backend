import { Router } from "express";
import {
  applyForLeave,
  approveLeave,
  getAllLeaves,
  getHistory,
} from "../controllers/leaveController.js";

const router = Router();

router.post("/apply", applyForLeave);
router.put("/approve-or-reject/:leaveId", approveLeave);
router.get("/get-all", getAllLeaves);
router.get("/history/:appliedBy", getHistory);

export default router;
