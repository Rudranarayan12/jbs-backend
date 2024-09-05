import { isValidObjectId } from "mongoose";
import { Order } from "../models/OrderModel.js";
import { Task } from "../models/TaskModel.js";
import { isEmpty } from "../utils/helper.js";
import { Product } from "../models/ProductModel.js";
import { NotificationTitle, sendNotification } from "../utils/notification.js";
import { User } from "../models/UserModel.js";

export const assignNewTask = async (req, res, next) => {
  try {
    const {
      assignedTo,
      assignedBy,
      taskName,
      deadline,
      empDepartment,
      orderID,
    } = req.body;
    if (
      [assignedTo, assignedBy, taskName, deadline, empDepartment].some(isEmpty)
    ) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }
    if (orderID && !isValidObjectId(orderID)) {
      return res.status(400).json({
        success: false,
        message: "invalid order id",
      });
    }

    if (!isValidObjectId(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "invalid assigned employee id",
      });
    }
    if (!isValidObjectId(assignedBy)) {
      return res.status(400).json({
        success: false,
        message: "invalid assigner id",
      });
    }
    const employee = await User.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "employee not found",
      });
    }
    const assigner = await User.findById(assignedBy);
    if (!assigner) {
      return res.status(404).json({
        success: false,
        message: "assigner not found",
      });
    }
    if (orderID) {
      const order = await Order.findById(orderID);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "order not found",
        });
      }
      if (employee?.empSubDepartment) {
        order.productionStatus = employee.empSubDepartment;
      }
      order.deliveryStatus = "processing";
      await order.save();
    }

    const newTask = await Task.create({ ...req.body, status: "pending" });

    // notification
    await sendNotification({
      fcmToken: employee?.FCM_TOKEN,
      recipient: employee?._id,
      title: NotificationTitle?.task_assignment,
      body: taskName,
      taskId: newTask?._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "task assigned successfully",
      data: newTask,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const { orderID, assignedBy, assignedTo, status } = req.query;

    const query = {};

    if (orderID) {
      if (!isValidObjectId(orderID)) {
        return res.status(400).json({
          success: false,
          message: "invalid order id",
        });
      } else {
        query.orderID = orderID;
      }
    }
    if (assignedBy) {
      if (!isValidObjectId(assignedBy)) {
        return res.status(400).json({
          success: false,
          message: "invalid assigner id",
        });
      } else {
        query.assignedBy = assignedBy;
      }
    }
    if (assignedTo) {
      if (!isValidObjectId(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "invalid employee id",
        });
      } else {
        query.assignedTo = assignedTo;
      }
    }

    if (status) query.status = status;

    const tasks = await Task.find({ ...query })
      .populate("assignedTo", "name empDepartment empSubDepartment")
      .populate("assignedBy", "name")
      .populate("orderID", "orderID")
      .sort({ createdAt: -1 });
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskByTaskID = async (req, res, next) => {
  try {
    const { taskID } = req.params;
    if (!isValidObjectId(taskID)) {
      return res.status(400).json({
        success: false,
        message: "invalid task id",
      });
    }
    const populateOptions = [
      {
        path: "orderID",
        select:
          "-paymentDetails.paymentDoc -paymentDetails.paymentHistory -paymentDetails.paymentMethod -approverDetails",
        populate: [
          {
            path: "productDetails.product",
            model: "Product",
            select: "-color -size -pattern -category",
          },
          {
            path: "managedBy",
            model: "User",
            select: "name ",
          },
          {
            path: "customerDetails.customer",
            model: "User",
            select: "name email phoneNo",
          },
        ],
      },
      {
        path: "assignedTo",
        select: "name email phoneNo",
      },
      {
        path: "assignedBy",
        select: "name email phoneNo",
      },
    ];
    const task = await Task.findById(taskID).populate(populateOptions);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "task fetched successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const { taskID } = req.params;

    if (!isValidObjectId(taskID)) {
      return res.status(400).json({
        success: false,
        message: "invalid task id",
      });
    }
    const task = await Task.findById(taskID).populate("assignedBy");
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "task not found",
      });
    }
    if (task?.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "task already completed",
      });
    }
    task.status = "completed";
    task.completedOn = Date.now();
    await task.save();

    // notification
    await sendNotification({
      fcmToken: task?.assignedBy?.FCM_TOKEN,
      recipient: task?.assignedBy?._id,
      title: NotificationTitle?.task_update,
      body: task?.taskName + "is completed",
      taskId: task?._id.toString(),
    });

    return res.status(202).json({
      success: true,
      message: "task completed successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { taskID } = req.params;
    if (!taskID || !isValidObjectId(taskID)) {
      return res.status(400).json({
        success: false,
        message: "invalid task id",
      });
    }
    const task = await Task.findByIdAndDelete(taskID);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "task not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
