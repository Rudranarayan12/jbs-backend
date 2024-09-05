import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
    },
    imgUrl: {
      type: String,
    },
    body: {
      type: String,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    imgUrl: {
      type: String,
    },
    // timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Notification = model("Notification", notificationSchema);
