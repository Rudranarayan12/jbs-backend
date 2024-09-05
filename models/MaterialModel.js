import { Schema, model } from "mongoose";

const materialSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "material name is required"],
    },
    size: {
      type: String,
    },

    color: {
      type: String,
    },
    pattern: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
    },
    status: {
      type: String,
      enum: ["in_stock", "out_of_stock"],
      default: "out_of_stock",
    },
    materialID: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Material = model("Material", materialSchema);
