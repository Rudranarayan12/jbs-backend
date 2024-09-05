import express from "express";
import { isAuthenticated, isAdmin } from "./../middlewares/authMiddlewares.js";
import {
  createOrder,
  getAllOrders,
  getAllOrderDetailsByUserID,
  getOrderDetailsByID,
  recordOrderPaymentDetails,
  assignManagerToOrder,
  getOrdersByManager,
  updateOrderDeliveryStatus,
  getOrderPaymentHistory,
  getAllOrderInvoices,
  downloadOrderInvoice,
  generateCustomInvoice,
  getOrderList,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/create-order", createOrder);

router.get("/get-all-orders", isAuthenticated, getAllOrders);

router.get(
  "/get-orders-by-user/:userID",
  isAuthenticated,
  getAllOrderDetailsByUserID
);

router.get("/get-order-by-id/:orderID", isAuthenticated, getOrderDetailsByID);

router.put(
  "/record-order-payment-details",
  isAuthenticated,
  recordOrderPaymentDetails
);

router.put(
  "/assign-manager/:orderId/:managerID",
  isAuthenticated,
  isAdmin,
  assignManagerToOrder
);

router.get("/get-orders-by-manager", isAuthenticated, getOrdersByManager);
router.put(
  "/update-order-status/:orderID",
  isAuthenticated,
  updateOrderDeliveryStatus
);

router.get(
  "/get-payment-history/:orderID",
  isAuthenticated,
  getOrderPaymentHistory
);
router.get("/get-invoices", isAuthenticated, getAllOrderInvoices);
router.get("/download-invoice/:orderID", isAuthenticated, downloadOrderInvoice);
router.post("/generate-custom-invoice", generateCustomInvoice);
router.get("/list", isAuthenticated, getOrderList);

export default router;
