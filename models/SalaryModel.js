import { Schema, model } from "mongoose";

const salarySchema = Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
    basicSalary: {
      type: Number,
      default: 0,
    },
    slipNo: {
      type: String,
    },
    overTimePay: {
      type: Number,
      default: 0,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    totalEarning: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    otherDeduction: {
      type: Number,
      default: 0,
    },
    totalDeduction: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    slip: {
      type: String,
    },
  },
  { timestamps: true }
);

salarySchema.pre("save", function (next) {
  this.totalEarning = this.basicSalary + this.overTimePay + this.allowances;

  this.totalDeduction =
    (this.totalEarning * this.taxRate) / 100 + this.otherDeduction;

  this.netSalary = this.totalEarning - this.totalDeduction;

  next();
});
export const Salary = model("Salary", salarySchema);
