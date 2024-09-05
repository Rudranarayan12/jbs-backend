import { Schema, isValidObjectId, model } from "mongoose";
import { Transaction } from "../models/TransactionModel.js";
import { formatDate, generateRandomID } from "../utils/helper.js";
import { generateSalesInvoice } from "../utils/pdf.js";

const calculateGST = (baseAmount, gstRate) => {
  return (baseAmount * gstRate) / 100;
};

export const createTransaction = async (req, res, next) => {
  try {
    const {
      trType,
      trsProductDetails,
      trsShippingFee = 0,
      trsTotalAmount,
      trsDiscount = 0,
      ...rest
    } = req.body;
    let transactionData = { ...rest, trType };
    if (trType === "sales") {
      const updatedProductDetails = trsProductDetails?.map((product) => {
        if (parseInt(product?.trsQuantity) <= 0) {
          product.trsQuantity = 1;
        }
        const priceMultipliedByQuantity =
          parseFloat(product?.trsBaseAmount) * parseFloat(product?.trsQuantity);
        const gstAmount = calculateGST(
          priceMultipliedByQuantity,
          parseFloat(product.trsGST)
        );
        const grossAmount = priceMultipliedByQuantity + gstAmount;

        return {
          ...product,
          trsBaseAmount: parseFloat(product?.trsBaseAmount),
          trsQuantity: parseFloat(product?.trsQuantity),
          trsGST: parseFloat(product?.trsGST),
          trsGrossAmount: Math.round(grossAmount),
        };
      });
      const trsTotalAmount = updatedProductDetails.reduce(
        (acc, product) => acc + product?.trsGrossAmount,
        0
      );
      const trsFinalAmount = Math.round(
        parseFloat(trsTotalAmount) +
          parseFloat(trsShippingFee) -
          parseFloat(trsDiscount)
      );
      transactionData = {
        ...transactionData,
        trsProductDetails: updatedProductDetails,
        trsTotalAmount,
        trsShippingFee,
        trsFinalAmount,
        trsDiscount: trsDiscount ? parseFloat(trsDiscount) : 0,
        trID: generateRandomID(8, "TRS"),
      };
    } else if (trType === "expense") {
      transactionData = {
        ...transactionData,
        trID: generateRandomID(8, "TRE"),
        // trExTotalAmount: rest.trExTotalAmount,
      };
    }
    const newTransaction = await Transaction.create(transactionData);
    return res.status(201).json({
      success: true,
      message: "Transaction Added Successfully",
      data: newTransaction,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTransactions = async (req, res, next) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type) {
      query.trType = type;
    }
    const transactions = await Transaction.find({ ...query }).sort({
      createdAt: -1,
    });
    if (!transactions) {
      return res.status(404).json({
        success: false,
        message: "no transaction found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Transaction fetched Successfully",
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
export const getTransactionByID = async (req, res, next) => {
  try {
    const { transactionID } = req.body;
    if (!isValidObjectId(transactionID)) {
      return res.status(400).json({
        success: false,
        message: "invalid transaction id",
      });
    }
    const transaction = await Transaction.findById(transactionID);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "transaction not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "transaction fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const downloadTransactionInvoice = async (req, res, next) => {
  try {
    const { transactionID } = req.params;
    if (!isValidObjectId(transactionID)) {
      return res.status(400).json({
        success: false,
        message: "invalid transaction id",
      });
    }
    const transaction = await Transaction.findById(transactionID);
    if (transaction?.trsInvoice) {
      return res.status(200).json({
        success: true,
        message: "invoice generated successfully",
        data: transaction?.trsInvoice,
      });
    }
    let invoiceNo = generateRandomID("7", "TRS-");
    let productList = transaction?.trsProductDetails?.map((item) => {
      return {
        itemName: item?.trsProductName,
        itemId: item?.trsProductID,
        itemQuantity: item?.trsQuantity,
        itemGrossAmount: item?.trsBaseAmount,
        itemGST: item?.trsGST,
        itemPrice: item?.trsGrossAmount,
      };
    });
    const invoiceData = {
      invoiceNo,
      billName: transaction?.trsCustomerName,
      billAddress: transaction?.trsBillingAddress,
      billPhoneNo: transaction?.trsCustomerPhoneNo,
      shipName: transaction?.trsCustomerName,
      shipAddress: transaction?.trsShippingAddress,
      shipPhoneNo: transaction?.trsCustomerPhoneNo,
      invoiceDate: formatDate(transaction?.createdAt),
      price: transaction?.trsFinalAmount,
      productList,
      subTotal: transaction?.trsTotalAmount,
      shippingCharges: transaction?.trsShippingFee,
      totalPrice: transaction?.trsFinalAmount,
      discount: transaction?.trsDiscount,
    };
    const generatedInvoice = await generateSalesInvoice(invoiceData, next);
    if (!generatedInvoice) {
      throw new Error("failed to generate invoice");
    }
    transaction.trsInvoice = generatedInvoice;
    transaction.trsInvoiceID = invoiceNo;
    await transaction.save();
    return res.status(201).json({
      success: true,
      message: "invoice generated successfully",
      data: generatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};
export const downloadUploadedExpenseBill = async (req, res, next) => {
  try {
    const { transactionID } = req.params;
    if (!isValidObjectId(transactionID)) {
      return res.status(400).json({
        success: false,
        message: "invalid transaction id",
      });
    }
    const transaction = await Transaction.findById(transactionID);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "transaction not found",
      });
    }
    if (!transaction?.trDoc) {
      return res.status(404).json({
        success: false,
        message: "no bills uploaded",
      });
    }
    return res.status(200).json({
      success: true,
      message: "bill fetched successfully",
      data: transaction?.trDoc,
    });
  } catch (error) {
    next(error);
  }
};
