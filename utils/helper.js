import crypto from "crypto";
import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";

export const isEmpty = (field) => {
  if (typeof field === "string") {
    return !field.trim();
  } else if (Array.isArray(field)) {
    return field.length === 0;
  } else if (typeof field === "number") {
    return field <= 0;
  } else {
    return !field;
  }
};

export const generateRandomID = (length, prefix) => {
  const now = new Date();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const timePart = minutes + seconds;

  const randomPart = crypto
    .randomBytes(length - 4)
    .toString("hex")
    .slice(0, length - 4)
    .toUpperCase();

  return prefix ? prefix + randomPart + timePart : randomPart + timePart;
};

export const createOTP = () => {
  return otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};
export function formatDate(dateString) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const date = new Date(dateString);
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month}, ${year}`;
}
export const getDepartment = (dept) => {
  switch (dept) {
    case "sales":
      return "Sales";
    case "production":
      return "Production";
    case "procurement_and_inventory":
      return "Inventory";
    case "delivery":
      return "Delivery";
    case "accounts":
      return "Accountant";
    case "manager":
      return "Manager";

    default:
      return "N/A";
  }
};
export const getPaymentMethod = (paymentMethod) => {
  switch (paymentMethod) {
    case "bank_transfer_or_upi":
      return "Bank Transfer / UPI";
    case "cash":
      return "Cash";
    case "check":
      return "Check";
    default:
      return "N/A";
  }
};
