import { Schema, model } from "mongoose";

const otpSchema = Schema(
  {
    phoneNo: {
      type: String,
    },
    email: {
      type: String,
    },
    otp: {
      type: String,
      required: true,
    },
    creationTime: {
      type: Date,
      default: Date.now,
      // expires: 60 * 5,
    },
  },
  { timestamps: true }
);

export const OTP = model("OTP", otpSchema);
