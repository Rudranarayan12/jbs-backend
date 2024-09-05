import { isValidObjectId } from "mongoose";
import { isEmpty } from "./../utils/helper.js";
import { Leave } from "../models/LeaveModel.js";
import moment from "moment";
import { User } from "../models/UserModel.js";
import { NotificationTitle, sendNotification } from "../utils/notification.js";

export const applyForLeave = async (req, res, next) => {
  try {
    const { fromDate, toDate, causeOfLeave } = req.body;
    const { _id } = req.user;
    const appliedBy = _id.toString();

    if ([fromDate, toDate, causeOfLeave].some(isEmpty)) {
      return res.status(400).json({
        success: false,
        message: "Provide all required fields",
      });
    }

    const from = moment(fromDate);
    const to = moment(toDate);
    const currentDate = moment().startOf("day");

    if (from.isBefore(currentDate) || to.isBefore(currentDate)) {
      return res.status(400).json({
        success: false,
        message: "Dates should be greater than or equal to the current date",
      });
    }

    if (from.isAfter(to)) {
      return res.status(400).json({
        success: false,
        message: "From date should not be later than to date",
      });
    }

    const newLeave = await Leave.create({
      appliedBy,
      fromDate,
      toDate,
      causeOfLeave,
    });

    const admin = await User.findOne({ role: "admin" });
    await sendNotification({
      recipient: admin?._id,
      title: NotificationTitle?.leave_applied,
      body: `${req?.user?.name} has applied for leave from ${from.format(
        "MM DD, YYYY"
      )} to ${to.format("MM DD, YYYY")}`,
    });

    return res.status(201).json({
      success: true,
      message: "Leave requested successfully",
      data: newLeave,
    });
  } catch (error) {
    next(error);
  }
};

export const approveLeave = async (req, res, next) => {
  try {
    const { approvalStatus } = req.body;
    const { _id } = req.user;
    const { leaveId } = req.params;
    const approvedBy = _id.toString();
    if (
      !approvalStatus &&
      approvalStatus !== "approved" &&
      approvalStatus !== "rejected"
    ) {
      return res.status(400).json({
        success: false,
        message: "invalid approval status",
      });
    }
    if (req?.user?.role !== "admin" && req?.user?.empDepartment !== "manager") {
      return res.status(400).json({
        success: false,
        message: `you don't have right to ${
          approvalStatus === "approved" ? "approve" : "reject"
        } leave`,
      });
    }

    if (!isValidObjectId(leaveId)) {
      return res.status(400).json({
        success: false,
        message: "invalid leave id",
      });
    }

    const existingLeave = await Leave.findById(leaveId)
      .populate("appliedBy")
      .populate("approvedBy");

    if (
      existingLeave?.appliedBy?.empDepartment === req?.user?.empDepartment ||
      existingLeave?.appliedBy?._id?.toString() === approvedBy
    ) {
      return res.status(400).json({
        success: false,
        message: `you don't have right to ${
          approvalStatus === "approved" ? "approve" : "reject"
        } leave`,
      });
    }
    if (existingLeave?.approvalStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `leave is already ${existingLeave?.approvalStatus} by ${
          existingLeave?.approvedBy?.name
        } on ${moment(existingLeave?.approvedOn).format("MMM DD, YYYY")}`,
      });
    }

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      {
        approvalStatus,
        approvedBy,
        approvedOn: Date.now(),
      },
      {
        new: true,
      }
    );
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "leave not found",
      });
    }
    await sendNotification({
      recipient: existingLeave?.appliedBy?._id,
      title:
        approvalStatus === "approved"
          ? NotificationTitle?.leave_approved
          : NotificationTitle?.leave_rejected,
      body: `Your leave has been ${approvalStatus} by ${req?.user?.name}`,
      fcmToken: existingLeave?.appliedBy?.FCM_TOKEN,
    });

    return res.status(200).json({
      success: true,
      message: `leave ${approvalStatus} successfully`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const { appliedBy } = req.params;

    if (!isValidObjectId(appliedBy)) {
      return res.status(400).json({
        success: false,
        message: "invalid employee id",
      });
    }
    const employee = await User.findById(appliedBy);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "employee not found",
      });
    }

    const leaves = await Leave.find({
      appliedBy,
    })
      .populate("approvedBy", "name phoneNo empDepartment role")
      .sort({ createdAt: -1 });

    // (employee.password = undefined), (employee.FCM_TOKEN = undefined);
    return res.status(200).json({
      success: true,
      message: `leave history fetched successfully`,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLeaves = async (req, res, next) => {
  try {
    const { status, time } = req.query;
    let query = {};

    if (status) query.approvalStatus = status;
    if (time && time === "today") {
      const today = moment().startOf("day");
      query = {
        ...query,
        fromDate: { $lte: today.toDate() },
        toDate: { $gte: today.toDate() },
      };
    }

    const allLeaves = await Leave.find({ ...query })
      .populate("approvedBy", "name phoneNo empDepartment role")
      .populate("appliedBy", "name phoneNo empDepartment role")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "leaves requests fetched successfully",
      data: allLeaves,
    });
  } catch (error) {
    next(error);
  }
};
