import express, { Router } from "express";
import {
  addNewQuery,
  getAllQueries,
  followQuery,
  assignOrRevokeEmployeeForQuery,
  getQueriesByEmployee,
  getQueryDetailsByID,
} from "../controllers/queryControllers.js";
const router = Router();

router.post("/add-new-query", addNewQuery);
router.get("/get-all", getAllQueries);
router.get("/get-by-id/:queryId", getQueryDetailsByID);
router.put("/assign-or-revoke", assignOrRevokeEmployeeForQuery);
router.get("/assigned-queries/:employeeId", getQueriesByEmployee);
router.put("/follow-on", followQuery);

export default router;
