import { Product } from "../models/ProductModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Category } from "./../models/CategoryModel.js";

export const addProductCategory = async (req, res, next) => {
  const { name } = req.body;
  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "category already exists",
      });
    }

    const newCategory = await Category.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no category found",
      });
    }
    // const categoryWithNoOfProducts = categories?.map(async (category) => {
    //   const products = await Product.find({ category: category._id });
    //   console.log(products);
    //   return { ...category, totalProducts: products?.length };
    // });
    return res.status(200).json({
      success: true,
      message: "categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
