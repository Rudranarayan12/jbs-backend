import { Router } from "express";
import {
  customerChartStats,
  employeeChartStats,
  financialChartStats,
  getAllStats,
  orderChartStats,
  getAllMaterialStats,
} from "../controllers/statsController.js";

const router = Router();
router.get("/dashboard-details", getAllStats);
router.get("/chart/order", orderChartStats);
router.get("/chart/employee", employeeChartStats);
router.get("/chart/customer", customerChartStats);
router.get("/chart/financial", financialChartStats);
router.get("/dashboard-details/inventory", getAllMaterialStats);

export default router;
