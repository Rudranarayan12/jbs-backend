import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "category name is required"],
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
