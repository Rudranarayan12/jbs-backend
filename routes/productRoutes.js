import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddlewares.js";
import {
  addNewProduct,
  getAllProductsDetails,
  getProductDetailsByID,
  getProductsByCategory,
  updateProductVisibility,
  getProductList,
  updateProductStock,
} from "../controllers/productControllers.js";

const router = express.Router();

// adds a new product || POST || by Admin
router.post("/add-product", isAuthenticated, addNewProduct);

// gets all of the products || GET
router.get("/get-all-products", getAllProductsDetails);

// gets a product by its ID || GET
router.get("/get-by-id/:id", getProductDetailsByID);

// get products by category || GET
router.get("/get-by-category/:categoryID", getProductsByCategory);

router.put("/update-product-visibility/:productID", updateProductVisibility);

router.get("/get-product-list", getProductList);

router.put("/update-stock", isAuthenticated, isAdmin, updateProductStock);

export default router;
