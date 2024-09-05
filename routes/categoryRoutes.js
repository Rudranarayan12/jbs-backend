import express from "express";
import {
  addProductCategory,
  getAllCategories,
} from "../controllers/categoryController.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// creates a new category || POST
router.post("/add-category", addProductCategory);

// get all categories || GET
router.get("/get-all-categories", getAllCategories);

export default router;
