import express from "express";
import {
  createRequest,
  getAllRequest,
  getRequestByID,
  getRequestsByUser,
  updateRequest,
  approveRequest,
  deleteRequest,
} from "../controllers/requestController.js";

const router = express.Router();

router.post("/create-request", createRequest);
router.get("/get-all-requests", getAllRequest);
router.get("/get-request-by-id/:reqID", getRequestByID);
router.get("/get-requests-by-user", getRequestsByUser);
router.put("/update-request/:reqID", updateRequest);
router.put("/approve-request/:reqID", approveRequest);
router.delete("/delete-request/:reqID", deleteRequest);

export default router;
