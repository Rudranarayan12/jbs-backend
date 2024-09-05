import moment from "moment";
import { Order } from "../models/OrderModel.js";
import { User } from "../models/UserModel.js";
import { Salary } from "../models/SalaryModel.js";
import { Transaction } from "../models/TransactionModel.js";
import { Material } from "../models/MaterialModel.js";
import { Request } from "../models/RequestModel.js";

const startOfYear = moment().startOf("year").toDate();
const startOfMonth = moment().startOf("month").toDate();
const startOfWeek = moment().startOf("week").toDate();
const sixMonthsAgo = moment().subtract(5, "months").startOf("month").toDate();
const yearAgo = moment().subtract(11, "months").startOf("month").toDate();
const endOfLastMonth = moment().subtract(1, "months").endOf("month").toDate();
const startOfLastMonth = moment()
  .subtract(1, "months")
  .startOf("month")
  .toDate();

const formatStatusCounts = (statusCounts) => {
  const statusMap = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  };

  statusCounts.forEach((statusCount) => {
    statusMap[statusCount._id] = statusCount.count;
  });

  return statusMap;
};

export const orderStats = async () => {
  try {
    const stats = await Order.aggregate([
      {
        $facet: {
          totalOrders: [{ $count: "count" }],

          currentYearOrders: [
            { $match: { createdAt: { $gte: startOfYear } } },
            { $count: "count" },
          ],
          currentMonthOrders: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "count" },
          ],
          currentWeekOrders: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $count: "count" },
          ],
        },
      },
    ]);

    return {
      totalOrders: stats[0].totalOrders[0]?.count || 0,
      currentYearOrders: stats[0].currentYearOrders[0]?.count || 0,
      currentMonthOrders: stats[0].currentMonthOrders[0]?.count || 0,
      currentWeekOrders: stats[0].currentWeekOrders[0]?.count || 0,
    };
  } catch (err) {
    throw Error(err);
  }
};

export const customerStats = async () => {
  try {
    const stats = await User.aggregate([
      {
        $match: { role: "user" },
      },
      {
        $facet: {
          totalCustomers: [{ $count: "count" }],
          currentYearCustomers: [
            { $match: { createdAt: { $gte: startOfYear } } },
            { $count: "count" },
          ],
          currentMonthCustomers: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "count" },
          ],
          currentWeekCustomers: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $count: "count" },
          ],
        },
      },
    ]);

    return {
      totalCustomers: stats[0].totalCustomers[0]?.count || 0,
      currentYearCustomers: stats[0].currentYearCustomers[0]?.count || 0,
      currentMonthCustomers: stats[0].currentMonthCustomers[0]?.count || 0,
      currentWeekCustomers: stats[0].currentWeekCustomers[0]?.count || 0,
    };
  } catch (err) {
    throw Error(err);
  }
};

export const employeeStats = async () => {
  try {
    const stats = await User.aggregate([
      {
        $match: { role: "employee" },
      },

      {
        $facet: {
          totalEmployees: [{ $count: "count" }],
          currentYearEmployees: [
            { $match: { createdAt: { $gte: startOfYear } } },
            { $count: "count" },
          ],
          currentMonthEmployees: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "count" },
          ],
          currentWeekEmployees: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $count: "count" },
          ],
        },
      },
    ]);

    return {
      totalEmployees: stats[0].totalEmployees[0]?.count || 0,
      currentYearEmployees: stats[0].currentYearEmployees[0]?.count || 0,
      currentMonthEmployees: stats[0].currentMonthEmployees[0]?.count || 0,
      currentWeekEmployees: stats[0].currentWeekEmployees[0]?.count || 0,
    };
  } catch (err) {
    throw Error(err);
  }
};

export const orderStatsForCharts = async () => {
  try {
    const startOfMonth = moment().startOf("month").toDate();

    const stats = await Order.aggregate([
      {
        $facet: {
          lastSixMonthsTotalOrders: [
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $count: "count" },
          ],
          lastSixMonthsOrdersByMonth: [
            {
              $match: { createdAt: { $gte: yearAgo } },
            },
            {
              $group: {
                _id: {
                  month: { $month: "$createdAt" },
                  year: { $year: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
          currentMonthTotalOrders: [
            {
              $match: { createdAt: { $gte: startOfMonth } },
            },
            { $count: "count" },
          ],
          currentMonthStatusCounts: [
            {
              $match: { createdAt: { $gte: startOfMonth } },
            },
            {
              $group: {
                _id: "$deliveryStatus",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const lastSixMonthsOrders = [];
    for (let i = 11; i >= 0; i--) {
      const date = moment().subtract(i, "months");
      lastSixMonthsOrders.push({
        month: date.format("MMMM YYYY"),
        count: 0,
      });
    }

    stats[0].lastSixMonthsOrdersByMonth.forEach((monthOrder) => {
      const monthYear = `${moment.months()[monthOrder._id.month - 1]} ${
        monthOrder._id.year
      }`;
      const index = lastSixMonthsOrders.findIndex(
        (month) => month.month === monthYear
      );
      if (index !== -1) {
        lastSixMonthsOrders[index].count = monthOrder.count;
      }
    });

    return {
      lastSixMonthsTotalOrders:
        stats[0].lastSixMonthsTotalOrders[0]?.count || 0,
      lastSixMonthsOrders: lastSixMonthsOrders,
      currentMonthTotalOrders: stats[0].currentMonthTotalOrders[0]?.count || 0,
      currentMonthStatusCounts: formatStatusCounts(
        stats[0].currentMonthStatusCounts
      ),
    };
  } catch (err) {
    throw Error(err);
  }
};

export const customerStatsForCharts = async () => {
  try {
    const startOfLastYear = moment()
      .subtract(1, "year")
      .startOf("year")
      .toDate();
    const startOfMonth = moment().startOf("month").toDate();

    const stats = await User.aggregate([
      {
        $match: { role: "user" },
      },

      {
        $facet: {
          totalCustomersLastYear: [
            { $match: { createdAt: { $gte: startOfLastYear } } },
            { $count: "count" },
          ],
          customersByMonthLastYear: [
            {
              $match: { createdAt: { $gte: startOfLastYear } },
            },
            {
              $group: {
                _id: {
                  month: { $month: "$createdAt" },
                  year: { $year: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
        },
      },
    ]);

    // Initialize array for last twelve months
    const lastTwelveMonthsCustomers = [];
    for (let i = 11; i >= 0; i--) {
      const date = moment().subtract(i, "months");
      lastTwelveMonthsCustomers.push({
        month: date.format("MMMM YYYY"),
        count: 0,
      });
    }

    // Populate customer counts for each month
    stats[0].customersByMonthLastYear.forEach((monthCustomer) => {
      const monthYear = `${moment.months()[monthCustomer._id.month - 1]} ${
        monthCustomer._id.year
      }`;
      const index = lastTwelveMonthsCustomers.findIndex(
        (month) => month.month === monthYear
      );
      if (index !== -1) {
        lastTwelveMonthsCustomers[index].count = monthCustomer.count;
      }
    });

    return {
      totalCustomersLastYear: stats[0].totalCustomersLastYear[0]?.count || 0,
      customersByMonthLastYear: lastTwelveMonthsCustomers,
    };
  } catch (err) {
    throw Error(err);
  }
};

export const employeeStatsForCharts = async () => {
  try {
    const departments = [
      "sales",
      "production",
      "procurement_and_inventory",
      "delivery",
      "accounts",
      "manager",
    ];

    const stats = await User.aggregate([
      {
        $match: { role: "employee" },
      },

      {
        $facet: {
          totalEmployees: [{ $count: "count" }],

          departmentCounts: [
            {
              $group: {
                _id: "$empDepartment",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const departmentMap = departments.reduce((acc, department) => {
      acc[department] = 0;
      return acc;
    }, {});

    if (stats[0].departmentCounts.length > 0) {
      stats[0].departmentCounts.forEach((departmentCount) => {
        departmentMap[departmentCount._id] = departmentCount.count;
      });
    }

    return {
      totalEmployees: stats[0].totalEmployees[0]?.count || 0,
      ...departmentMap,
    };
  } catch (error) {
    throw Error(err);
  }
};

export const salaryStatsForCharts = async () => {
  try {
    const startOfLastSixMonths = moment()
      .subtract(6, "months")
      .startOf("month")
      .toDate();

    const stats = await Salary.aggregate([
      {
        $match: { createdAt: { $gte: startOfLastSixMonths } },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalNetSalary: { $sum: "$netSalary" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const lastSixMonthsNetSalary = [];
    for (let i = 5; i >= 0; i--) {
      const date = moment().subtract(i, "months");
      lastSixMonthsNetSalary.push({
        month: date.format("MMMM YYYY"),
        totalNetSalary: 0,
      });
    }

    stats.forEach((monthSalary) => {
      const monthYear = `${moment.months()[monthSalary._id.month - 1]} ${
        monthSalary._id.year
      }`;
      const index = lastSixMonthsNetSalary.findIndex(
        (month) => month.month === monthYear
      );
      if (index !== -1) {
        lastSixMonthsNetSalary[index].totalNetSalary =
          monthSalary.totalNetSalary;
      }
    });

    return lastSixMonthsNetSalary;
  } catch (err) {
    throw Error(err);
  }
};

export const financialStats = async () => {
  try {
    let salaryStats = await Salary.aggregate([
      {
        $facet: {
          totalSalary: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$netSalary",
                },
              },
            },
          ],
          totalSalaryThisYear: [
            { $match: { createdAt: { $gte: startOfYear } } },
            { $group: { _id: null, total: { $sum: "$netSalary" } } },
          ],
          totalSalaryThisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$netSalary" } } },
          ],
          totalSalaryThisWeek: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $group: { _id: null, total: { $sum: "$netSalary" } } },
          ],
        },
      },
    ]);
    let transactionStats = await Transaction.aggregate([
      {
        $facet: {
          totalSales: [
            { $match: { trType: "sales" } },
            { $group: { _id: null, total: { $sum: "$trsFinalAmount" } } },
          ],
          totalExpenses: [
            { $match: { trType: "expense" } },
            { $group: { _id: null, total: { $sum: "$trExTotalAmount" } } },
          ],
          salesThisYear: [
            { $match: { trType: "sales", createdAt: { $gte: startOfYear } } },
            { $group: { _id: null, total: { $sum: "$trsFinalAmount" } } },
          ],
          expensesThisYear: [
            {
              $match: { trType: "expense", createdAt: { $gte: startOfYear } },
            },
            { $group: { _id: null, total: { $sum: "$trExTotalAmount" } } },
          ],
          salesThisMonth: [
            { $match: { trType: "sales", createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$trsFinalAmount" } } },
          ],
          expensesThisMonth: [
            {
              $match: { trType: "expense", createdAt: { $gte: startOfMonth } },
            },
            { $group: { _id: null, total: { $sum: "$trExTotalAmount" } } },
          ],
          salesThisWeek: [
            { $match: { trType: "sales", createdAt: { $gte: startOfWeek } } },
            { $group: { _id: null, total: { $sum: "$trsFinalAmount" } } },
          ],
          expensesThisWeek: [
            {
              $match: { trType: "expense", createdAt: { $gte: startOfWeek } },
            },
            { $group: { _id: null, total: { $sum: "$trExTotalAmount" } } },
          ],
        },
      },
    ]);

    return {
      totalSales: transactionStats[0].totalSales[0]?.total || 0,
      totalExpenses: transactionStats[0].totalExpenses[0]?.total || 0,
      totalSalary: salaryStats[0].totalSalary[0]?.total || 0,
      yearly: [
        transactionStats[0].salesThisYear[0]?.total || 0,
        transactionStats[0].expensesThisYear[0]?.total || 0,
        salaryStats[0].totalSalaryThisYear[0]?.total || 0,
      ],
      monthly: [
        transactionStats[0].salesThisMonth[0]?.total || 0,
        transactionStats[0].expensesThisMonth[0]?.total || 0,
        salaryStats[0].totalSalaryThisMonth[0]?.total || 0,
      ],
      weekly: [
        transactionStats[0].salesThisWeek[0]?.total || 0,
        transactionStats[0].expensesThisWeek[0]?.total || 0,
        salaryStats[0].totalSalaryThisWeek[0]?.total || 0,
      ],
    };
  } catch (error) {
    throw Error(error);
  }
};

export const financialStatsForCharts = async () => {
  try {
    const salesStats = await Transaction.aggregate([
      { $match: { trType: "sales", createdAt: { $gte: yearAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$trsFinalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const expenseStats = await Transaction.aggregate([
      { $match: { trType: "expense", createdAt: { $gte: yearAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalExpenses: { $sum: "$trExTotalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const salaryStats = await Salary.aggregate([
      { $match: { createdAt: { $gte: yearAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSalary: { $sum: "$netSalary" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const lastTwelveMonths = [];
    for (let i = 11; i >= 0; i--) {
      const date = moment().subtract(i, "months");
      lastTwelveMonths.push({
        month: date.format("MMMM YYYY"),
        totalSales: 0,
        totalExpenses: 0,
        totalSalary: 0,
        profit: 0,
        loss: 0,
      });
    }

    const updateStats = (stats, key) => {
      stats.forEach((stat) => {
        const date = moment()
          .year(stat._id.year)
          .month(stat._id.month - 1);
        const formattedDate = date.format("MMMM YYYY");
        const index = lastTwelveMonths.findIndex(
          (month) => month.month === formattedDate
        );
        if (index !== -1) {
          lastTwelveMonths[index][key] = stat[key];
        }
      });
    };

    updateStats(salesStats, "totalSales");
    updateStats(expenseStats, "totalExpenses");
    updateStats(salaryStats, "totalSalary");

    lastTwelveMonths.forEach((month) => {
      const profitLoss =
        month.totalSales - (month.totalExpenses + month.totalSalary);
      if (profitLoss > 0) {
        month.profit = profitLoss;
        month.loss = 0;
      } else {
        month.profit = 0;
        month.loss = Math.abs(profitLoss);
      }
    });

    return lastTwelveMonths;
  } catch (err) {
    console.error("Error fetching last twelve months stats:", err);
    throw err;
  }
};

export const inventoryStats = async () => {
  try {
    const requestsStats = await Request.aggregate([
      {
        $facet: {
          totalRequests: [{ $count: "count" }],
          totalRequestsThisYear: [
            { $match: { createdAt: { $gte: startOfYear } } },
            { $count: "count" },
          ],
          totalRequestsThisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "count" },
          ],
          totalRequestsThisWeek: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $count: "count" },
          ],
          lastSixMonthsRequests: [
            { $match: { createdAt: { $gte: yearAgo } } },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
          lastMonthRequests: [
            {
              $match: {
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
              },
            },
            { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
          ],
        },
      },
    ]);

    const materialsStats = await Material.aggregate([
      {
        $facet: {
          totalMaterials: [{ $count: "count" }],
          totalMaterialsThisYear: [
            { $match: { createdAt: { $gte: startOfYear } } },
            { $count: "count" },
          ],
          totalMaterialsThisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "count" },
          ],
          totalMaterialsThisWeek: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $count: "count" },
          ],
          lastSixMonthsMaterials: [
            { $match: { createdAt: { $gte: yearAgo } } },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
        },
      },
    ]);

    const lastSixMonthsData = [];
    for (let i = 11; i >= 0; i--) {
      const date = moment().subtract(i, "months");
      const formattedDate = date.format("MMMM YYYY");

      const requestCount =
        requestsStats[0].lastSixMonthsRequests.find(
          (item) =>
            item._id.year === date.year() && item._id.month === date.month() + 1
        )?.count || 0;

      const materialCount =
        materialsStats[0].lastSixMonthsMaterials.find(
          (item) =>
            item._id.year === date.year() && item._id.month === date.month() + 1
        )?.count || 0;

      lastSixMonthsData.push({
        month: formattedDate,
        requestsCount: requestCount,
        materialsCount: materialCount,
      });
    }

    const lastMonthStatusCounts = requestsStats[0].lastMonthRequests.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {}
    );

    return {
      requestsStats: {
        totalRequests: requestsStats[0]?.totalRequests[0]?.count || 0,
        totalRequestsThisYear:
          requestsStats[0].totalRequestsThisYear[0]?.count || 0,
        totalRequestsThisMonth:
          requestsStats[0].totalRequestsThisMonth[0]?.count || 0,
        totalRequestsThisWeek:
          requestsStats[0].totalRequestsThisWeek[0]?.count || 0,
        lastSixMonthsRequests: lastSixMonthsData.map((item) => ({
          month: item.month,
          count: item.requestsCount,
        })),
        lastMonthStatusCounts,
      },
      materialsStats: {
        totalMaterials: materialsStats[0].totalMaterials[0]?.count || 0,
        totalMaterialsThisYear:
          materialsStats[0].totalMaterialsThisYear[0]?.count || 0,
        totalMaterialsThisMonth:
          materialsStats[0].totalMaterialsThisMonth[0]?.count || 0,
        totalMaterialsThisWeek:
          materialsStats[0].totalMaterialsThisWeek[0]?.count || 0,
        lastSixMonthsMaterials: lastSixMonthsData.map((item) => ({
          month: item.month,
          count: item.materialsCount,
        })),
      },
    };
  } catch (err) {
    throw Error(err);
  }
};
