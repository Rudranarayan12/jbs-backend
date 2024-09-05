import { Schema, model } from "mongoose";

const invoiceSchema = new Schema(
  {
    orderID: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    invoiceID: {
      type: String,
      required: true,
    },
    invoice: { type: String },
    // status: {
    //   type: String,
    //   enum: ["pending", "paid"],
    //   default: "pending",
    // },
  },
  { timestamps: true }
);

export const Invoice = model("Invoice", invoiceSchema);
