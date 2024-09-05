import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    // common for both sales and expenses
    trID: {
      type: String,
    },
    trPaymentID: {
      type: String,
    },
    trDate: {
      type: Date,
    },
    trType: {
      type: String,
      required: [true, "transaction type required"],
      enum: ["expense", "sales"],
    },
    trDescription: {
      type: String,
      required: [true, "transaction description required"],
    },
    trAdditionalNotes: {
      type: String,
    },
    trPaymentMethod: {
      type: String,
      required: [true, "payment method required"],
      enum: ["check", "bank_transfer_or_upi", "cash"],
    },
    trDoc: {
      type: String,
    },
    // only for sales
    trsProductDetails: [
      {
        trsProductRef: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        trsProductName: {
          type: String,
        },
        trsProductID: {
          type: String,
        },
        trsBaseAmount: {
          type: Number,
        },
        trsQuantity: {
          type: Number,
        },
        trsGST: {
          type: Number,
          enum: [0, 5, 10, 12, 18, 28],
          default: 0,
        },
        trsGrossAmount: {
          type: Number,
        },
      },
    ],
    trsTotalAmount: {
      type: Number,
    },
    trsShippingFee: {
      type: Number,
    },
    trsDiscount: {
      type: Number,
    },
    trsFinalAmount: {
      type: Number,
    },
    trsCustomerName: {
      type: String,
    },
    trsCustomerPhoneNo: {
      type: String,
    },
    trsPaymentDate: {
      type: String,
    },
    trsBillingAddress: {
      type: String,
    },
    trsShippingAddress: {
      type: String,
    },
    trsInvoice: {
      type: String,
    },
    trsInvoiceID: {
      type: String,
    },
    //  only for expenses
    trExCategory: {
      type: String,
    },
    trExPartyName: {
      type: String,
    },
    trExPartyEmail: {
      type: String,
    },
    trExPartyMobileNo: {
      type: String,
    },
    trExTotalAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Transaction = model("Transaction", transactionSchema);
