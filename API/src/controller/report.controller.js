import Order from "../model/order.schema.js";
import Inventory from "../model/inventory.js";
import ExcelJS from "exceljs";
import mongoose from "mongoose";


export const salesReport = async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;

    const match = {};
    if (branchId) match.branch = new mongoose.Types.ObjectId(branchId);
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const report = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },

      {
        $group: {
          _id: {
            branch: "$branch",
            productName: "$items.productName",
            productCode: "$items.productCode",
          },
          qty: { $sum: "$items.qty" },
          sales: { $sum: { $multiply: ["$items.qty", "$items.price"] } }
        }
      },

      
      {
        $group: {
          _id: "$_id.branch",
          totalSales: { $sum: "$sales" },
          products: {
            $push: {
              name: "$_id.productName",
              code: "$_id.productCode",
              qty: "$qty",
              sales: "$sales"
            }
          }
        }
      },

    
      {
        $lookup: {
          from: "branches",
          localField: "_id",
          foreignField: "_id",
          as: "branch"
        }
      },
      { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 0,
          branch: { $ifNull: ["$branch.branchName", "Unknown Branch"] },
          totalSales: 1,
          products: 1
        }
      }
    ]);

    res.json(report);
  } catch (err) {
    console.error("Error in salesReport:", err);
    res.status(500).json({ message: err.message });
  }
};



export const lowStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const lowStock = await Inventory.find({ quantity: { $lt: threshold } })
      .populate("productId branchId", "name");

    res.json({ count: lowStock.length, lowStock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





export const exportSalesReport = async (req, res) => {
  try {
    const reportData = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: { product: "$items.productName", branch: "$branch" },
          totalQty: { $sum: "$items.qty" },
          totalSales: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
    ]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "Branch", key: "branch", width: 20 },
      { header: "Product", key: "product", width: 30 },
      { header: "Total Quantity", key: "totalQty", width: 20 },
      { header: "Total Sales", key: "totalSales", width: 20 },
    ];

    reportData.forEach((r) => {
      worksheet.addRow({
        branch: r._id.branch?.toString() || "Unknown",
        product: r._id.product || "Unknown",
        totalQty: r.totalQty,
        totalSales: r.totalSales,
      });
    });

    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.xlsx"
    );

    
    await workbook.xlsx.write(res);

    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    res.status(500).json({ message: err.message });
  }
};






