import { Material } from "./../models/MaterialModel.js";
import { generateRandomID, isEmpty } from "../utils/helper.js";
import { isValidObjectId } from "mongoose";

export const addMaterial = async (req, res, next) => {
  try {
    const { name, size, color, pattern, unit, stock } = req.body;
    if ([name, unit].some(isEmpty)) {
      return res.status(400).json({
        success: false,
        message: "please provide required details of material",
      });
    }

    let query = {};
    size && (query.size = size);
    color && (query.color = color);
    pattern && (query.pattern = pattern);

    const material = await Material.findOne({ name, unit, ...query });
    if (material) {
      return res.status(400).json({
        success: false,
        message: "material already exists",
      });
    }

    const newMaterial = await Material.create({
      ...req.body,
      materialID: generateRandomID(7, "MAT"),
      status: stock > 0 ? "in_stock" : "out_of_stock",
    });
    return res.status(201).json({
      success: true,
      message: "material added to inventory successfully",
      data: newMaterial,
    });
  } catch (error) {
    next(error);
  }
};
export const getAllMaterials = async (req, res, next) => {
  try {
    const materials = await Material.find({}).sort({ createdAt: -1 });
    if (!materials) {
      return res.status(404).json({
        success: false,
        message: "no material found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "materials fetched successfully",
      data: materials,
    });
  } catch (error) {
    next(error);
  }
};
export const updateMaterial = async (req, res, next) => {
  try {
    const { matID } = req.params;
    const { stock, type } = req.body;

    const updateDetails = {};
    if (!isValidObjectId(matID)) {
      return res.status(400).json({
        success: false,
        message: "invalid material id",
      });
    }
    const material = await Material.findById(matID);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "material not found",
      });
    }
    if (stock && type === "stock_in") {
      updateDetails.stock = material?.stock + stock;
      updateDetails.status = "in_stock";
    } else if (stock && type === "stock_out") {
      if (material?.stock < stock) {
        return res.status(400).json({
          success: false,
          message: "insufficient stock",
        });
      }
      updateDetails.stock = material?.stock - stock;
      if (updateDetails?.stock === 0) {
        updateDetails.status = "out_of_stock";
      }
    }
    await material.updateOne({ ...req.body, ...updateDetails });
    return res.status(200).json({
      success: true,
      message: "material updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const deleteMaterial = async (req, res, next) => {
  try {
    const { matID } = req.params;
    if (!isValidObjectId(matID)) {
      return res.status(400).json({
        success: false,
        message: "invalid material id",
      });
    }
    const material = await Material.findByIdAndDelete(matID);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "material not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "material deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
