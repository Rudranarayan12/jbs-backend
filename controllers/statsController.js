import {
  customerStats,
  customerStatsForCharts,
  employeeStats,
  orderStats,
  orderStatsForCharts,
  employeeStatsForCharts,
  salaryStatsForCharts,
  financialStats,
  financialStatsForCharts,
  inventoryStats,
} from "../utils/stats.js";

export const getAllStats = async (req, res, next) => {
  try {
    const orders = await orderStats();
    const customers = await customerStats();
    const employees = await employeeStats();
    const financial = await financialStats();
    res.status(200).json({
      success: true,
      message: "successfully fetched stats",
      data: {
        orderStats: orders,
        customerStats: customers,
        employeeStats: employees,
        financialStats: financial,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const orderChartStats = async (req, res, next) => {
  try {
    const data = await orderStatsForCharts();
    res.status(200).json({
      success: true,
      message: "order stats fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
export const customerChartStats = async (req, res, next) => {
  try {
    const data = await customerStatsForCharts();
    res.status(200).json({
      success: true,
      message: "customer stats fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
export const employeeChartStats = async (req, res, next) => {
  try {
    const empData = await employeeStatsForCharts();
    const salaryData = await salaryStatsForCharts();
    res.status(200).json({
      success: true,
      message: "employee stats fetched successfully",
      data: {
        employeeDetails: empData,
        salaryDetails: salaryData,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const financialChartStats = async (req, res, next) => {
  try {
    const data = await financialStatsForCharts();
    res.status(200).json({
      success: true,
      message: "financial stats fetched successfully",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMaterialStats = async (req, res, next) => {
  try {
    const data = await inventoryStats();
    res.status(200).json({
      success: true,
      message: "material stats fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
