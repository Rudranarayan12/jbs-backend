import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    productID: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "product name must be required"],
    },
    color: [
      {
        type: String,
      },
    ],
    size: [
      {
        type: String,
      },
    ],
    pattern: [
      {
        type: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    keyFeatures: {
      type: String,
    },
    materialInfo: {
      type: String,
    },
    description: {
      type: String,
    },
    basePrice: {
      type: Number,
      default: 0,
    },
    hsnCode: {
      type: String,
    },
    gst: {
      type: Number,
    },
    price: {
      type: Number,
    },
    images: [
      {
        type: String,
      },
    ],
    isVisible: {
      type: Boolean,
      default: true,
    },
    includedComponents: {
      type: String,
    },
    certifications: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
    },
    stockStatus: {
      type: ["in_stock", "out_of_stock"],
      default: "out_of_stock",
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
