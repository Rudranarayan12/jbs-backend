import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    FCM_TOKEN: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    phoneNo: {
      type: String,
      required: [true, "phone no is required"],
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      required: [true, "user role is required"],
      enum: ["admin", "employee", "user"],
    },
    dob: {
      type: Date,
    },
    address: {
      type: String,
    },
    empEmployeeID: {
      type: String,
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
    empSubDepartment: {
      type: String,
      enum: ["carpenter", "carbin", "polishing", "cushioning", "packaging"],
    },
    empDateOfHire: {
      type: Date,
    },
    empUserName: {
      type: String,
    },
    empEmgContactName: {
      type: String,
    },
    empEmgContactPhone: {
      type: String,
    },
    empEmgAddtionalInfo: {
      type: String,
    },
    empPayFrequency: {
      type: String,
      enum: ["monthly", "hourly"],
    },
    empSalaryPerFrequency: {
      type: String,
    },
    empPaymentMethod: {
      type: String,
      enum: ["check", "bank_transfer_or_upi", "cash"],
    },
    empBankName: {
      type: String,
    },
    empAccountNo: {
      type: String,
    },
    empIFSC: {
      type: String,
    },
    empBranchName: {
      type: String,
    },
    // empTotalSalaryPerFrequency: {
    //   type: String,
    // },
    empTimeStamps: {
      type: String,
    },
    isCheckedIn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
