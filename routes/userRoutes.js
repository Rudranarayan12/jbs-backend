import express from "express";
import {
  employeeList,
  getAllUsersDetails,
  getEmployeeDetailsByID,
  getUsersDetailsByRoleOrDept,
  updateUserDetailsByID,
} from "../controllers/userControllers.js";
import { isAuthenticated } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/get-all-users", isAuthenticated, getAllUsersDetails);

router.get(
  "/users-by-role-or-dept",
  // isAuthenticated,
  getUsersDetailsByRoleOrDept
);

router.get("/get-emp-details/:empID", getEmployeeDetailsByID);

router.put("/update-user-details/:userID", updateUserDetailsByID);

router.get("/employee-list", employeeList);

export default router;
