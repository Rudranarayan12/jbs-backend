import { Schema, model } from "mongoose";

const requestSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "order id is required"],
    },

    materialId: {
      type: Schema.Types.ObjectId,
      ref: "Material",
      required: [true, "material id is required"],
    },
    requiredQuantity: {
      type: Number,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "requested employee is required"],
    },
    requestedDate: {
      type: Date,
      default: Date.now(),
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedDate: {
      type: Date,
    },

    currentStatus: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Request = model("Request", requestSchema);
