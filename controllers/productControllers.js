import { isValidObjectId } from "mongoose";
import { Product } from "../models/ProductModel.js";
import { Category } from "./../models/CategoryModel.js";
import { generateRandomID, isEmpty } from "./../utils/helper.js";

export const addNewProduct = async (req, res, next) => {
  try {
    const {
      name,
      color,
      size,
      pattern,
      category,
      keyFeatures,
      materialInfo,
      description,
      price,
      images,
      basePrice,
      gst,
      hsnCode,
      stock,
    } = req.body;
    if (
      [
        name,
        color,
        size,
        pattern,
        category,
        keyFeatures,
        materialInfo,
        description,
        price,
        images,
        basePrice,
        gst,
        hsnCode,
      ].some(isEmpty)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all required data" });
    }
    if (price <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "price must be a positive number" });
    }

    const product = await Product.create({
      productID: generateRandomID(8, "PRD"),
      name,
      color,
      size,
      pattern,
      category,
      keyFeatures,
      materialInfo,
      description,
      price,
      images,
      basePrice: parseFloat(basePrice),
      gst: parseFloat(gst),
      price: parseFloat(price),
      hsnCode,
      stock: stock ? parseFloat(stock) : 0,
      stockStatus: parseFloat(stock) > 0 ? "in_stock" : "out_of_stock",
    });

    return res.status(201).json({
      success: true,
      data: product,
      message: "product added successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProductsDetails = async (req, res, next) => {
  try {
    const { visibility } = req.query;
    const query = {};
    if (visibility) {
      query.isVisible = visibility;
    }
    const products = await Product.find(query)
      .populate("category")
      .sort({ createdAt: -1 });

    if (!products || products?.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "no products found" });
    }

    return res.status(200).json({
      success: true,
      data: products,
      message: "products fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const getProductList = async (req, res, next) => {
  try {
    const { visibility } = req.query;
    const query = {};
    if (visibility) {
      query.isVisible = visibility;
    }
    const products = await Product.find(query)
      .select("name productID price gst hsnCode basePrice")
      .sort({ createdAt: -1 });

    if (!products || products?.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "no products found" });
    }

    return res.status(200).json({
      success: true,
      data: products,
      message: "products fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getProductDetailsByID = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid product" });
    }

    const product = await Product.findById({ _id: id }).populate("category");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: "product fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryID } = req.params;
    const { visibility } = req.query;
    console.log(req.query);
    const query = {};
    if (visibility !== undefined) {
      query.isVisible = visibility;
    }

    const category = await Category.findById(categoryID).sort({
      createdAt: -1,
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "category not found",
      });
    }
    const products = await Product.find({
      category: categoryID,
      ...query,
    }).populate("category");

    return res.status(200).json({
      success: true,
      message: "product fetched successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductVisibility = async (req, res, next) => {
  try {
    const { productID } = req.params;
    const { visibility } = req.body;
    if (!isValidObjectId(productID)) {
      return res.status(400).json({
        success: false,
        message: "invalid product id",
      });
    }
    if (visibility === null || typeof visibility !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "please provide visibility",
      });
    }
    const product = await Product.findByIdAndUpdate(
      productID,
      { isVisible: visibility },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }
    return res.status(202).json({
      success: true,
      message: "product visibility updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (req, res, next) => {
  try {
    const { productId, type, quantity } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "invalid product id",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }
    if (type !== "stock_in" && type !== "stock_out") {
      return res.status(400).json({
        success: false,
        message: "invalid operation",
      });
    }
    if (type === "stock_in") {
      product.stock += parseFloat(quantity);
      product.stockStatus = "in_stock";
    } else {
      if (product.stock < parseFloat(quantity)) {
        return res.status(400).json({
          success: false,
          message: "insufficient stock",
        });
      }
      product.stock -= parseFloat(quantity);
      product.stockStatus = "out_of_stock";
    }
    product.save();
    return res.status(202).json({
      success: true,
      message: "product stock updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
