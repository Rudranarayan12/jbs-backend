import { Attendance } from "../models/AttendanceModel.js";
import { isValidObjectId } from "mongoose";
import { isEmpty } from "../utils/helper.js";
import { User } from "../models/UserModel.js";

export const employeeCheckIn = async (req, res, next) => {
  try {
    const { location, time, image } = req.body;
    const { _id } = req.user;
    const empId = _id.toString();

    if ([location, time, image].some(isEmpty)) {
      return res.status(400).json({
        success: false,
        message: "please provide all required data",
      });
    }
    const employee = await User.findById(empId);
    const existedCheckIn = await Attendance.find({ employeeId: empId });

    if (existedCheckIn.length !== 0) {
      const checkInCreatedDate =
        existedCheckIn[existedCheckIn.length - 1].createdAt;

      const presentDate = new Date(checkInCreatedDate).getDate();
      const currentDate = new Date().getDate();

      if (presentDate === currentDate) {
        return res.status(201).json({
          success: false,
          message: "employee check in once in a day",
        });
      }
    }

    const createdAttendance = await Attendance.create({
      employeeId: empId,
      checkInTime: time,
      checkInImage: image,
      checkInLocation: location,
      checkOutTime: "",
      checkOutLocation: "",
    });
    employee.isCheckedIn = true;
    await employee.save();
    return res.status(201).json({
      success: true,
      message: "employee checked in successfully",
      data: createdAttendance,
    });
  } catch (error) {
    next(error);
  }
};

export const employeeCheckOut = async (req, res, next) => {
  try {
    const { location, time } = req.body;
    const { _id } = req.user;
    const empId = _id.toString();

    if ([location, time].some(isEmpty)) {
      return res.status(400).json({
        success: false,
        message: "please provide all required data",
      });
    }

    const employee = await User.findById(empId);

    const currentDate = new Date().getDate();

    const existedCheckIn = await Attendance.find({ employeeId: empId });

    if (existedCheckIn.length === 0) {
      return res.status(404).json({
        success: false,
        message: "check in not found",
      });
    }

    const checkInCreatedDate =
      existedCheckIn[existedCheckIn.length - 1].createdAt;

    const presentCheckInDate = new Date(checkInCreatedDate).getDate();

    if (currentDate != presentCheckInDate) {
      return res.status(404).json({
        success: false,
        message: "check in for today not found",
      });
    }
    const existedAttendance = existedCheckIn[existedCheckIn.length - 1];

    if (existedAttendance?.checkOutTime?.trim() != "") {
      return res.status(400).json({
        success: false,
        message: "employee already checked out",
      });
    }

    existedAttendance.checkOutLocation = location;
    existedAttendance.checkOutTime = time;

    await existedAttendance.save({ validateBeforeSave: false });

    employee.isCheckedIn = false;
    await employee.save();
    return res.status(200).json({
      success: true,
      message: "employee checked out successfully",
      data: existedAttendance,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendancesByEmployee = async (req, res, next) => {
  try {
    const { empID } = req.query;
    const { _id } = req.user;
    const emp_Id = _id.toString();
    let query = {};
    query.employeeId = empID ? empID : emp_Id;
    const attendances = await Attendance.find(query).sort({
      createdAt: -1,
    });

    if (!attendances) {
      return res.status(404).json({
        success: false,
        message: "attendance not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "attendance fetched successfully",
      data: attendances,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAttendances = async (req, res, next) => {
  try {
    const allAttendance = await Attendance.find().sort({ createdAt: -1 });

    if (!allAttendance || allAttendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no attendance record found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "attendance records retrieved successfully",
      data: allAttendance,
    });
  } catch (error) {
    next(error);
  }
};
