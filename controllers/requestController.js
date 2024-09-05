import { isValidObjectId } from "mongoose";
import { Request } from "../models/RequestModel.js";
import { Material } from "../models/MaterialModel.js";
import { Order } from "./../models/OrderModel.js";
import { User } from "../models/UserModel.js";
import { NotificationTitle, sendNotification } from "../utils/notification.js";

export const createRequest = async (req, res, next) => {
  try {
    const { orderId, materialId, requestedBy, requiredQuantity } = req.body;

    if (!orderId || !materialId || !requestedBy) {
      return res.status(400).json({
        success: false,
        message: "please provide all required fields",
      });
    }

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "invalid order ID",
      });
    }
    if (!isValidObjectId(materialId)) {
      return res.status(400).json({
        success: false,
        message: "invalid material ID",
      });
    }

    if (!isValidObjectId(requestedBy)) {
      return res.status(400).json({
        success: false,
        message: "invalid requester ID",
      });
    }
    const order = await Order.findById(orderId).populate(
      "productDetails.product"
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
    }
    const material = await Material.findById(materialId);
    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: "material not found" });
    }
    const requester = await User.findById(requestedBy);
    if (!requester) {
      return res
        .status(404)
        .json({ success: false, message: "requester not found" });
    }
    const request = await Request.create(req.body);

    // notification
    const users = await User.find({
      empDepartment: "procurement_and_inventory",
    });

    users?.forEach(async (item) => {
      await sendNotification({
        fcmToken: item?.FCM_TOKEN,
        recipient: item?._id,
        title: NotificationTitle?.material_request,
        body: requiredQuantity + " " + material?.name,
        imgUrl: order?.productDetails?.product?.images[0],
      });
    });
    return res.status(201).json({
      success: true,
      message: "request sent successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRequest = async (req, res, next) => {
  const { orderId } = req.query;

  let query = {};
  if (orderId) {
    query.orderId = orderId;
  }
  try {
    const requests = await Request.find({ ...query })
      .populate({
        path: "orderId",
        select: "orderID",
        populate: {
          path: "productDetails.product",
          select: "name productID category description price images",
        },
      })
      .populate({
        path: "materialId",
      })
      .populate({
        path: "requestedBy",
        select: "name",
      })
      .populate({
        path: "approvedBy",
        select: "name",
      })
      .sort({ createdAt: -1 });
    if (requests?.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no material found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getRequestByID = async (req, res, next) => {
  try {
    const { reqID } = req.params;
    if (!isValidObjectId(reqID) || !reqID) {
      return res.status(400).json({
        success: false,
        message: "invalid request id",
      });
    }
    const request = await Request.findById(reqID)
      .populate({
        path: "orderId",
        select: "orderID",
      })
      .populate("materialId");
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "request not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "request fetched successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
export const getRequestsByUser = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    const { _id } = req.user;
    const userID = _id.toString();
    let query = {};
    if (orderId) {
      query.orderId = orderId;
    }
    const requests = await Request.find({ requestedBy: userID, ...query })
      .populate({
        path: "orderId",
        select: "orderID",
      })
      .populate("materialId")
      .sort({ createdAt: -1 });
    if (!requests) {
      return res.status(404).json({
        success: false,
        message: "no request found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "request fetched successfully",
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (req, res, next) => {
  try {
    const { empDepartment, _id } = req.user;
    // if (empDepartment !== "procurement_and_inventory") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "user must be an inventory controller",
    //   });
    // }
    const { reqID } = req.params;
    if (!reqID || !isValidObjectId(reqID)) {
      return res.status(400).json({
        success: false,
        message: "invalid request",
      });
    }

    const request = await Request.findById(reqID).populate("requestedBy");
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "request not found",
      });
    }
    const material = await Material.findById(request?.materialId);
    if (request?.currentStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "request is already approved",
      });
    }

    if (material?.stock < request?.requiredQuantity) {
      return res.status(400).json({
        success: false,
        message: "insufficient stock",
      });
    }
    if (material?.stock === request?.requiredQuantity) {
      material.status = "out_of_stock";
    }
    material.stock -= request?.requiredQuantity;
    request.currentStatus = "approved";
    request.approvedDate = Date.now();
    request.approvedBy = _id.toString();
    await request.save();
    await material.save();

    // notification

    await sendNotification({
      fcmToken: request?.requestedBy?.FCM_TOKEN,
      recipient: request?.requestedBy?._id,
      title: NotificationTitle?.material_request_approval,
      body:
        request?.requiredQuantity + " " + material?.name + " has been approved",
    });
    return res.status(200).json({
      success: true,
      message: "request approved successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const updateRequest = async (req, res, next) => {
  try {
    const { reqID } = req.params;
    if (!reqID || !isValidObjectId(reqID)) {
      return res.status(400).json({
        success: false,
        message: "invalid request id",
      });
    }
    const request = await Request.findById(reqID);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "request not found",
      });
    }
    if (request?.currentStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "request hse been approved, please contact inventory team",
      });
    }
    await request.updateOne(req.body);
    return res.status(200).json({
      success: true,
      message: "request updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const deleteRequest = async (req, res, next) => {
  try {
    const { reqID } = req.params;
    if (!reqID || !isValidObjectId(reqID)) {
      return res.status(400).json({
        success: false,
        message: "invalid request id",
      });
    }
    const request = await Request.findByIdAndDelete(reqID);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "request deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
