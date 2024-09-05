import { isValidObjectId } from "mongoose";
import { User } from "../models/UserModel.js";
import moment from "moment";
import { Attendance } from "../models/AttendanceModel.js";

export const getAllUsersDetails = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password -otp")
      .sort({ createdAt: -1 });
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no user found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersDetailsByRoleOrDept = async (req, res, next) => {
  try {
    const { role, dept } = req.query;

    const query = {};
    if (role) query.role = role;
    if (dept) query.empDepartment = dept;

    const users = await User.find(query)
      .select("-password -otp")
      .sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: "No user found" });
    }

    if (role === "employee") {
      const startDate = moment().subtract(1, "months").startOf("month").date();
      const endDate = moment().subtract(1, "months").endOf("month").format();

      const attendances = await Attendance.find({
        employeeId: { $in: users.map((user) => user._id) },
        createdAt: { $gte: startDate, $lte: endDate },
      }).populate("employeeId", "name empDepartment");

      const attendanceByEmployee = attendances.reduce((acc, attendance) => {
        const employeeId = attendance.employeeId._id.toString();
        if (!acc[employeeId]) {
          acc[employeeId] = [];
        }
        acc[employeeId].push(attendance);
        return acc;
      }, {});
      console.log(attendanceByEmployee);
      const usersWithHours = users
        .map((user) => {
          if (user.role !== "employee") return user;

          const userAttendances =
            attendanceByEmployee[user._id.toString()] || [];
          const totalHours = userAttendances.reduce((acc, attendance) => {
            const checkInTime = moment(
              attendance.checkInTime,
              "D/M/YYYY, h:mm:ss A"
            );
            const checkOutTime = moment(
              attendance.checkOutTime,
              "D/M/YYYY, h:mm:ss A"
            );
            const duration = moment
              .duration(checkOutTime.diff(checkInTime))
              .asHours();
            return acc + duration;
          }, 0);

          return {
            ...user.toObject(),
            lastMonthWorkingHours: totalHours.toFixed(2),
          };
        })
        .filter((user) => user.role === "employee");

      return res.status(200).json({
        success: true,
        data: usersWithHours,
        message: `All ${role || ""}s fetched successfully`,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: users,
        message: `All ${role || ""}s fetched successfully`,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDetailsByID = async (req, res, next) => {
  const { empID } = req.params;
  try {
    if (!empID) {
      return res
        .status(400)
        .json({ success: false, message: "invalid employee id" });
    }
    const employee = await User.findOne({
      empEmployeeID: empID,
      role: "employee",
    }).select("name phoneNo");
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "employee not found" });
    }
    return res.status(200).json({
      success: true,
      message: "employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserDetailsByID = async (req, res, next) => {
  const { userID } = req.params;

  const { password } = req.body;
  if (password) {
    req.body.password = undefined;
  }
  try {
    if (!userID || !isValidObjectId(userID)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid user id" });
    }
    const user = await User.findById(userID);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    return res.status(200).json({
      success: true,
      message: "user updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const employeeList = async (req, res, next) => {
  try {
    let dept = req.query.dept;
    let role = req.query.role;
    if (dept && !Array.isArray(dept)) {
      dept = [dept];
    }
    if (role && !Array.isArray(role)) {
      role = [role];
    }
    let queryConditions = {};
    if (role) {
      queryConditions.role = { $in: role };
    }
    if (dept) {
      queryConditions.empDepartment = { $in: dept };
    }
    const employees = await User.find(queryConditions)
      .select("name role empDepartment empSubDepartment")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "employee fetched successfully",
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};
