import { Schema, model } from "mongoose";
import moment from "moment";

const leaveSchema = new Schema(
  {
    appliedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromDate: {
      type: Date,
    },
    toDate: {
      type: Date,
    },
    causeOfLeave: {
      type: String,
    },
    noOfDays: {
      type: Number,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedOn: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate noOfDays
leaveSchema.pre("save", function (next) {
  if (this.fromDate && this.toDate) {
    const from = moment(this.fromDate);
    const to = moment(this.toDate);

    const dayDifference = to.diff(from, "days") + 1;

    this.noOfDays = dayDifference;
  } else {
    this.noOfDays = 0;
  }

  next();
});

export const Leave = model("Leave", leaveSchema);
