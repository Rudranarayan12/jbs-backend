import express, { Router } from "express";
import {
  employeeCheckIn,
  employeeCheckOut,
  getAttendancesByEmployee,
  getAllAttendances,
} from "../controllers/attendanceControllers.js";

const router = Router();

router.post("/employee-check-in", employeeCheckIn);
router.put("/employee-check-out", employeeCheckOut);
router.get("/get-attendances-by-employee", getAttendancesByEmployee);
router.get("/get-all-attendances", getAllAttendances);

export default router;
