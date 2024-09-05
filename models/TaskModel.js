import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    orderID: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "employee id required"],
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "assigner id required"],
    },
    empDepartment: {
      type: String,
      enum: [
        "sales",
        "production",
        "procurement_and_inventory",
        "delivery",
        "accounts",
        "manager",
      ],
    },
    taskName: {
      type: String,
      required: [true, "task name required"],
    },
    deadline: {
      type: Date,
    },
    completedOn: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Task = model("Task", taskSchema);
