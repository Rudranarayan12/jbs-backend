import { isValidObjectId } from "mongoose";
import { User } from "../models/UserModel.js";
import { Query } from "../models/QueryModel.js";
import { isEmpty } from "../utils/helper.js";

export const addNewQuery = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, message, interestedProduct } = req.body;

    // Check for missing fields
    if ([name, email, phoneNumber, message, interestedProduct].some(isEmpty)) {
      return res.status(400).json({
        success: false,
        message: "please provide all required fields",
      });
    }

    // Create the query document
    const query = await Query.create({
      name,
      email,
      phoneNumber,
      message,
      interestedProduct,
    });

    // Successfully created
    return res.status(200).json({
      success: true,
      message: "query created successfully.",
      data: query,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllQueries = async (req, res, next) => {
  try {
    const queries = await Query.find({})
      .populate("assignedEmployees", "name email")
      .populate("followedBy.employee", "name email")
      .select("-followedBy -assignedEmployees")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "queries fetched successfully",
      data: queries,
    });
  } catch (error) {
    next(error);
  }
};

export const getQueryDetailsByID = async (req, res, next) => {
  try {
    const { queryId } = req.params;

    if (!isValidObjectId(queryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid query ID",
      });
    }

    const query = await Query.findById(queryId)
      .populate("assignedEmployees.employee", "name email empDepartment")
      .populate("followedBy.employee", "name email empDepartment");

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Query fetched successfully",
      data: query,
    });
  } catch (error) {
    next(error);
  }
};

export const assignOrRevokeEmployeeForQuery = async (req, res, next) => {
  try {
    const { queryId, employeeIds, action } = req.body;

    // Check if employeeIds is an array
    if (!Array.isArray(employeeIds)) {
      return res.status(400).json({
        success: false,
        message: "employeeIds must be an array",
      });
    }

    // Check if queryId is a valid ObjectId
    if (!isValidObjectId(queryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid query ID",
      });
    }

    // Check if employeeIds are valid ObjectIds and if they are employees
    const validEmployeeIds = await User.find({
      _id: { $in: employeeIds },
      role: "employee",
    }).select("_id");
    // console.log(validEmployeeIds);

    if (validEmployeeIds.length !== employeeIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some employee IDs are invalid or do not have employee role",
      });
    }

    let query;
    if (action === "assign") {
      // Find the query
      query = await Query.findById(queryId);

      if (!query) {
        return res.status(404).json({
          success: false,
          message: "Query not found",
        });
      }

      // Filter out already assigned employees
      const newAssignments = validEmployeeIds
        .map((emp) => emp._id)
        .filter(
          (empId) =>
            !query.assignedEmployees.some(
              (assigned) => assigned.employee.toString() === empId.toString()
            )
        )
        .map((empId) => ({
          employee: empId,
          assignedOn: new Date(),
        }));

      // Update the query by adding valid employee IDs with assignedOn date
      query = await Query.findByIdAndUpdate(
        queryId,
        {
          $addToSet: {
            assignedEmployees: {
              $each: newAssignments,
            },
          },
        },
        { new: true }
      );
    } else if (action === "revoke") {
      // Update the query by removing valid employee IDs
      query = await Query.findByIdAndUpdate(
        queryId,
        {
          $pull: {
            assignedEmployees: {
              employee: { $in: validEmployeeIds.map((emp) => emp._id) },
            },
            followedBy: {
              employee: { $in: validEmployeeIds.map((emp) => emp._id) },
            },
          },
        },
        { new: true }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action specified. Use 'assign' or 'revoke'.",
      });
    }

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        action === "assign"
          ? "Employee assignment successful"
          : "Employee revoke successful",
      data: query,
    });
  } catch (error) {
    next(error);
  }
};

export const getQueriesByEmployee = async (req, res, next) => {
  const { employeeId } = req.params;

  if (!isValidObjectId(employeeId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid employee ID",
    });
  }

  const employee = await User.findById(employeeId);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: "Employee not found",
    });
  }

  try {
    const queries = await Query.find({
      "assignedEmployees.employee": employeeId,
    })
      .select("-assignedEmployees")
      .populate("followedBy.employee", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Queries fetched successfully",
      data: queries,
    });
  } catch (error) {
    next(error);
  }
};

export const followQuery = async (req, res, next) => {
  try {
    const { queryId, employeeId, notes } = req.body;

    // Check if queryId is a valid ObjectId
    if (!isValidObjectId(queryId)) {
      return res.status(400).json({
        success: false,
        message: "invalid query ID",
      });
    }

    // Check if employeeId is a valid ObjectId
    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "invalid employee ID",
      });
    }

    // Check if employeeId exists and has employee role
    const employee = await User.findOne({ _id: employeeId, role: "employee" });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "employee not found",
      });
    }

    // Check if queryId exists
    const queryExists = await Query.findById(queryId);
    if (!queryExists) {
      return res.status(404).json({
        success: false,
        message: "query not found",
      });
    }

    // Add employee to followedBy if validations pass
    const query = await Query.findByIdAndUpdate(
      queryId,
      {
        $addToSet: { followedBy: { employee: employeeId, notes } },
        isFollowedOn: true,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "query followed on successfully",
      data: query,
    });
  } catch (error) {
    next(error);
  }
};
