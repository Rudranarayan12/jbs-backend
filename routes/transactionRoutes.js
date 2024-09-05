import express from "express";
import {
  createTransaction,
  downloadTransactionInvoice,
  downloadUploadedExpenseBill,
  getAllTransactions,
  getTransactionByID,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/create-transaction", createTransaction);
router.get("/get-all-transactions", getAllTransactions);
router.get("/get-transaction-by-id/:transactionID", getTransactionByID);
router.get(
  "/download-transaction-invoice/:transactionID",
  downloadTransactionInvoice
);
router.get("/fetch-expense-bill/:transactionID", downloadUploadedExpenseBill);

export default router;
