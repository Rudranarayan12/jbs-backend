import express from "express";
import {
  assignNewTask,
  deleteTask,
  getAllTasks,
  getTaskByTaskID,
  completeTask,
} from "../controllers/taskController.js";
// import { isAuthenticated } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/assign-new", assignNewTask);
router.get("/get-all", getAllTasks);
router.get("/get-by-id/:taskID", getTaskByTaskID);
router.put("/complete/:taskID", completeTask);
router.delete("/delete/:taskID", deleteTask);
export default router;
