import Inventory from "../model/inventory.js";
import Product from "../model/product.schema.js";
import XLSX from "xlsx";
import { parse } from "csv-parse";


export const upsertMyBranchInventory = async (req, res) => {
  try {

    // const branchId = req.user.branchId; 
    // if (!branchId) return res.status(400).json({ message: "User not assigned to a branch" });

    const { productId,branchId ,price, quantity, lowStockThreshold } = req.body;
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const updated = await Inventory.findOneAndUpdate(
      { productId, branchId },
 
      { $set: { price, quantity, lowStockThreshold } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};



export const getInventoryForBranch = async (req, res) => {
  try {
    let { branchId } = req.params;
    
     {
      if (!req.user.branchId || String(req.user.branchId) !== String(branchId)) {
        return res.status(403).json({ message: "Access denied for this branch" });
      }
    }
    const items = await Inventory.find({ branchId }).populate("productId", "name sku brand category");
    res.json(items);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const bulkUploadForMyBranch = async (req, res) => {
  try {
    const branchId = req.user.branchId;
    if (!branchId) return res.status(400).json({ message: "User not assigned to a branch" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const ext = (req.file.originalname.split(".").pop() || "").toLowerCase();
    let rows = [];

    if (ext === "csv") {
      rows = await parseCsvBuffer(req.file.buffer);
    } else if (ext === "xlsx" || ext === "xls") {
      rows = parseXlsxBuffer(req.file.buffer);
    } else {
      return res.status(400).json({ message: "Unsupported file type. Use CSV or Excel." });
    }

   
    const skus = rows.map(r => String(r.sku || "").trim()).filter(Boolean);
    const products = await Product.find({ sku: { $in: skus } }, "_id sku");
    const skuToId = new Map(products.map(p => [p.sku, p._id]));

    const ops = [];
    const unknownSkus = [];

    for (const r of rows) {
      const sku = String(r.sku || "").trim();
      const price = Number(r.price ?? 0);
      const quantity = Number(r.quantity ?? 0);
      const lowStockThreshold = Number(r.lowStockThreshold ?? 0);

      const productId = skuToId.get(sku);
      if (!productId) { unknownSkus.push(sku); continue; }

      ops.push({
        updateOne: {
          filter: { productId, branchId },
          update: { $set: { price, quantity, lowStockThreshold } },
          upsert: true
        }
      });
    }

    if (ops.length) await Inventory.bulkWrite(ops);

    res.json({
      updated: ops.length,
      unknownSkus
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


function parseXlsxBuffer(buffer) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return data.map(row => normalizeRow(row));
}

function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const out = [];
    parse(buffer, { columns: true, trim: true, skip_empty_lines: true }, (err, records) => {
      if (err) return reject(err);
      for (const r of records) out.push(normalizeRow(r));
      resolve(out);
    });
  });
}

function normalizeRow(r) {
  const pick = (obj, keys) => keys.find(k => k in obj) ? obj[keys.find(k => k in obj)] : undefined;
  return {
    sku: pick(r, ["sku", "SKU", "Sku"]),
    price: pick(r, ["price", "Price", "PRICE"]),
    quantity: pick(r, ["quantity", "Quantity", "QTY", "qty"]),
    lowStockThreshold: pick(r, ["lowStockThreshold", "LowStockThreshold", "LowStock", "threshold"])
  };
}
