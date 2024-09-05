import express from "express";
import {
  createSalary,
  generateSalarySlip,
  getSalaryDetailsOFEmployee,
} from "../controllers/salaryController.js";

const router = express.Router();

router.post("/create-salary", createSalary);
router.get(
  "/get-salary-details-by-employee/:empId",
  getSalaryDetailsOFEmployee
);
router.get("/get-all-salary-details", createSalary);
router.get("/download-salary-slip/:salaryId", generateSalarySlip);
export default router;
