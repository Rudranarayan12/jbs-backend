import { formatDate, generateRandomID, isEmpty } from "./../utils/helper.js";
import { Product } from "./../models/ProductModel.js";
import { Order } from "../models/OrderModel.js";
import { User } from "../models/UserModel.js";
import { isValidObjectId } from "mongoose";
import {
  generateCustomOrderInvoice,
  generateSingleOrderInvoice,
} from "../utils/pdf.js";
import { Invoice } from "./../models/InvoiceModel.js";
import { Notification } from "../models/NotificationModel.js";
import {
  NotificationTitle,
  sendNotification,
  sendOrderConfirmationEmail,
} from "./../utils/notification.js";
import { Task } from "../models/TaskModel.js";

export const createOrder = async (req, res, next) => {
  try {
    const { productDetails, customerDetails, paymentDetails, approverDetails } =
      req.body;

    const productDetailsArray = Array.isArray(productDetails)
      ? productDetails
      : [productDetails];

    for (const productDetail of productDetailsArray) {
      const existingProduct = await Product.findOne({
        _id: productDetail.product,
      });
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productDetail.product} not found`,
        });
      }
    }

    const existingUser = await User.findOne({ _id: customerDetails.customer });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingApprover = await User.findOne({
      empEmployeeID: approverDetails.employeeID,
      role: "employee",
    });
    if (!existingApprover) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    let orderID = generateRandomID(7, "ODR");

    const newOrder = await Order.create({
      ...req.body,
      productDetails: productDetailsArray,
      orderID,
      paymentDetails: {
        paymentHistory: [
          {
            paymentAmount: parseFloat(paymentDetails?.advanceAmount),
            paymentMethod: paymentDetails?.paymentMethod,
            paymentDoc: paymentDetails?.paymentDoc,
          },
        ],
        totalAmount: parseFloat(paymentDetails.totalAmount),
        remainingAmount:
          parseFloat(paymentDetails.totalAmount) -
          parseFloat(paymentDetails.advanceAmount),
        additionalComments: paymentDetails?.additionalComments,
      },
    });

    if (!existingUser?.address) {
      existingUser.address = customerDetails?.shippingAddress;
    }
    await existingUser.save();

    // Invoice generation
    await generateSingleOrderInvoice(newOrder?._id);

    // Notification
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    await sendNotification({
      recipient: admin?._id,
      title: NotificationTitle.order_creation,
      body: `Order for ${productDetailsArray.length} products created`,
      orderId: newOrder?._id.toString(),
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .select("-paymentDetails.paymentHistory")
      .populate("productDetails.product")
      .populate("customerDetails.customer")
      .populate({
        path: "managedBy",
        select: "name",
      })
      .sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no order found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
export const getOrderDetailsByID = async (req, res, next) => {
  try {
    const { orderID } = req.params;
    if (!isValidObjectId(orderID)) {
      return res.status(400).json({
        success: false,
        message: "please provide a valid order ID",
      });
    }

    const order = await Order.findById(orderID)
      .populate("productDetails.product")
      .populate("customerDetails.customer")
      .select("-paymentDetails.paymentHistory");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "no order found with this id",
      });
    }

    return res.status(200).json({
      success: true,
      message: "order details fetched successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrderDetailsByUserID = async (req, res, next) => {
  try {
    const { userID } = req.params;

    if (!isValidObjectId(userID)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid user ID",
      });
    }

    const user = await User.findById(userID);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const orders = await Order.find({
      "customerDetails.customer": userID,
    })
      .select("-paymentDetails.paymentHistory")
      .populate("productDetails.product")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no order found for the user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const recordOrderPaymentDetails = async (req, res, next) => {
  try {
    const { orderID, paymentDate, receivedPayment, paymentDoc, paymentMethod } =
      req.body;
    if ([orderID, receivedPayment, paymentMethod].some(isEmpty)) {
      return res.status(400).json({
        success: false,
        message: "please provide all fields",
      });
    }

    const order = await Order.findOne({ orderID });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "no order found with this id",
      });
    }
    if (order?.paymentDetails?.remainingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "already paid",
      });
    }
    if (order?.paymentDetails?.remainingAmount < receivedPayment) {
      return res.status(400).json({
        success: false,
        message: "payment amount should not be more than due",
      });
    }
    let payment = {
      paymentAmount: parseFloat(receivedPayment),
      paymentMethod,
      paymentDoc,
      paymentDate: paymentDate || Date.now(),
    };
    order.paymentDetails.remainingAmount -= parseFloat(receivedPayment);
    // order.paymentDetails.remainingAmount <= 0 && order.paymentDetails.remainingAmount=0

    order?.paymentDetails?.paymentHistory?.push(payment);
    await order.save();
    await generateSingleOrderInvoice(order?._id, next);
    return res.status(200).json({
      success: true,
      message: "payment details updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const assignManagerToOrder = async (req, res, next) => {
  try {
    const { orderId, managerID } = req.params;
    if (!orderId || !managerID) {
      return res.status(400).json({
        success: false,
        message: "please provide all fields",
      });
    }

    const manager = await User.findById(managerID).select("-password");
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "manager not found",
      });
    }
    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        managedBy: managerID,
        deliveryStatus: "confirmed",
      },
      { new: true }
    )
      .populate("productDetails.product")
      .populate("customerDetails.customer");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order not found",
      });
    }

    // push notification
    await sendNotification({
      fcmToken: manager?.FCM_TOKEN,
      recipient: manager?._id,
      title: NotificationTitle?.order_assignment,
      body: order?.productDetails?.map((product) => product?.name).join("   "),
      orderId: order?._id.toString(),
      imgUrl: order?.productDetails?.product?.images[0],
    });
    await sendOrderConfirmationEmail({
      to: order?.customerDetails?.customer?.email,
      customerName: order?.customerDetails?.customer?.name,
      orderID: order?.orderID,
      productFinalPrice: order?.paymentDetails?.totalAmount,
      productName: order?.productDetails?.product?.name,
      productQuantity: order?.productDetails?.requirements?.requiredQuantity,
      productPrice: order?.productDetails?.product?.price,
    });

    return res.status(200).json({
      success: true,
      message: "manager assigned successfully",
      // data: order,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const getOrdersByManager = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { status } = req.query;
    let query = {};
    if (status) query.deliveryStatus = status;
    const managerID = _id.toString();
    query.managedBy = managerID;

    const orders = await Order.find(query)
      .populate({
        path: "productDetails.product",
        populate: "category",
      })
      .populate({
        path: "customerDetails.customer",
        select: "-password",
      })
      .select("-paymentDetails")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no orders found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    // console.log(error);
    next(error);
  }
};

export const updateOrderDeliveryStatus = async (req, res, next) => {
  try {
    const { deliveryStatus, collectedAmount } = req.body;
    const { orderID } = req.params;

    if (!orderID) {
      return res.status(400).json({
        success: false,
        message: "Please provide order ID",
      });
    }

    if (!deliveryStatus) {
      return res.status(400).json({
        success: false,
        message: "Please provide delivery status",
      });
    }

    const existingOrder = await Order.findById(orderID)
      .populate("managedBy")
      .populate("productDetails.product");

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (deliveryStatus === "delivered") {
      // Check collected amount matches remaining amount or not
      if (collectedAmount !== existingOrder.paymentDetails.remainingAmount) {
        return res.status(400).json({
          success: false,
          message: "Collected amount is not matching due amount",
        });
      }
      existingOrder.paymentDetails.remainingAmount = "0";
      const newPayment = {
        paymentAmount: collectedAmount,
        paymentMethod: "cash",
      };
      existingOrder.paymentDetails.paymentHistory.push(newPayment);
    }

    existingOrder.deliveryStatus = deliveryStatus;

    await existingOrder.save();

    await generateSingleOrderInvoice(existingOrder._id);

    // Notification
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    const assignedManager = existingOrder.managedBy;

    if (admin && assignedManager) {
      const usersToNotify = [admin, assignedManager];

      for (const user of usersToNotify) {
        await sendNotification({
          fcmToken: user.FCM_TOKEN || undefined,
          recipient: user._id,
          title:
            deliveryStatus === "delivered"
              ? NotificationTitle.order_delivered
              : NotificationTitle.out_for_delivery,
          body: `OrderID: #${existingOrder.orderID}`,
          orderId: existingOrder._id.toString(),
          // imgUrl: existingOrder.productDetails.product.images[0],
        });
      }
    }

    return res.status(202).json({
      success: true,
      message: "Order status updated successfully",
      data: existingOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderPaymentHistory = async (req, res, next) => {
  try {
    const { orderID } = req.params;
    if (!isValidObjectId(orderID)) {
      return res.status(400).json({
        success: false,
        message: "invalid order id",
      });
    }
    const order = await Order.findById(orderID);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "order not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "payment history fetched successfully",
      data: order?.paymentDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrderInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({})
      .populate({
        path: "orderID",
        select: "orderID",
      })
      .sort({ updatedAt: -1 });
    if (!invoices) {
      return res.status(404).json({
        success: false,
        message: "no invoice found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "invoices fetched successfully",
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};
export const downloadOrderInvoice = async (req, res, next) => {
  try {
    const { orderID } = req.params;
    const invoice = await Invoice.findOne({ orderID });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "invoice not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "invoice fetched successfully",
      data: invoice?.invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const generateCustomInvoice = async (req, res, next) => {
  try {
    const invoice = await generateCustomOrderInvoice(req.body, next);
    return res.status(201).json({
      success: true,
      message: "invoice generated successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderList = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("productDetails.product")
      .populate("customerDetails.customer")
      .sort({ created: -1 });

    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "orders not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "orders fetched successfully",
      data: orders?.map((order) => ({
        _id: order?._id,
        orderID: order?.orderID,
        product: order?.productDetails?.product?.name,
        createdAt: order?.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};
