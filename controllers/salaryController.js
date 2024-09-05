import { isValidObjectId } from "mongoose";
import {
  formatDate,
  generateRandomID,
  getDepartment,
  isEmpty,
} from "../utils/helper.js";
import { User } from "../models/UserModel.js";
import { Salary } from "../models/SalaryModel.js";
import { generateSlip } from "./../utils/pdf.js";
import { getPaymentMethod } from "./../utils/helper.js";

export const createSalary = async (req, res, next) => {
  try {
    const {
      empId,
      basicSalary,
      overTimePay,
      allowances,
      taxRate,
      otherDeduction,
      notes,
    } = req.body;
    if ([basicSalary].some(isEmpty)) {
      return res.status(400).json({
        success: false,
        message: "provide necessary fields",
      });
    }
    if (!isValidObjectId(empId)) {
      return res.status(400).json({
        success: false,
        message: "invalid employee id",
      });
    }
    const user = await User.findById(empId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not founds",
      });
    }

    const newSalary = await Salary.create({
      employee: empId,
      basicSalary: (basicSalary && parseFloat(basicSalary)) || 0,
      overTimePay: (overTimePay && parseFloat(overTimePay)) || 0,
      allowances: (allowances && parseFloat(allowances)) || 0,
      taxRate: (taxRate && parseFloat(taxRate)) || 0,
      otherDeduction: (otherDeduction && parseFloat(otherDeduction)) || 0,
      slipNo: generateRandomID(8, "SLP-"),
      notes,
    });
    return res.status(201).json({
      success: true,
      message: "salary updated successfully",
      data: newSalary,
    });
  } catch (error) {
    next(error);
  }
};
export const getSalaryDetailsOFEmployee = async (req, res, next) => {
  try {
    const { empId } = req.params;
    if (!isValidObjectId(empId)) {
      return res.status(400).json({
        success: false,
        message: "invalid employee id",
      });
    }
    const user = await User.findById(empId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not founds",
      });
    }
    const salaries = await Salary.find({ employee: empId })
      //   .populate({
      //     path: "employee",
      //     select: "name empDepartment empEmployeeID",
      //   })
      .sort({ createdAt: -1 });
    return res.status(201).json({
      success: true,
      message: "salary data fetched successfully",
      data: salaries,
    });
  } catch (error) {
    next(error);
  }
};

export const generateSalarySlip = async (req, res, next) => {
  try {
    const { salaryId } = req.params;
    const salary = await Salary.findById(salaryId).populate("employee");
    if (salary?.slip) {
      return res.status(200).json({
        success: true,
        message: "salary slip generated successfully",
        data: salary?.slip,
      });
    }
    let salaryData = {
      empName: salary?.employee?.name,
      empId: salary?.employee?.empEmployeeID,
      empDepartment: getDepartment(salary?.employee?.empDepartment),
      empDesignation: getDepartment(salary?.employee?.empDepartment),
      empJoining: formatDate(salary?.employee?.empDateOfHire),
      empSlipNumber: salary?.slipNo,
      generateDate: formatDate(salary?.createdAt),
      basicPrice: salary?.basicSalary,
      allowancesPrice: salary?.allowances,
      overTimePrice: salary?.overTimePay,
      commissionPrice: 0,
      totalEarnings: salary?.totalEarning || 0,
      taxPrice: salary?.taxRate,
      otherPrice: salary?.otherDeduction,
      totalDeduction: salary?.totalDeduction,
      netSalary: salary?.netSalary,
      paymentDate: formatDate(salary?.createdAt),
      paymentMethod: getPaymentMethod(salary?.employee?.empPaymentMethod),
      bankAccount: salary?.employee?.empAccountNo,
      bankName: salary?.employee?.empBankName || "N/A",
      branch: salary?.employee?.empBranchName || "N/A",
    };
    const slip = await generateSlip(salaryData, next);
    if (!slip) {
      throw new Error("failed to generate slip");
    }
    salary.slip = slip;
    await salary.save();
    return res.status(201).json({
      success: true,
      message: "salary slip generated successfully",
      data: slip,
    });
  } catch (error) {
    next(error);
  }
};
