import Branch from "../model/branch.schema.js";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon as turfPolygon } from '@turf/helpers';

// Add a new store to a branch
export const addStore = async (req, res) => {
  try {
    const { name, isOpen, openTime, closeTime } = req.body;
    if (!name) return res.status(400).json({ message: "Store name is required" });

    const branch = await Branch.findById(req.params.branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    branch.stores.push({ name, isOpen, openTime, closeTime });
    await branch.save();

    res.status(201).json(branch.stores[branch.stores.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const updateStore = async (req, res) => {
  try {
    const { branchId, storeId } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    branch.stores = branch.stores.filter(s => s !== null);

    const store = branch.stores.find(s => s._id.toString() === storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    const allowedFields = ["name", "isOpen", "openTime", "closeTime"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        store[field] = req.body[field];
      }
    }

    await branch.save();
    res.json(store);
  } catch (err) {
    console.error("Update store error:", err);
    res.status(500).json({ message: err.message });
  }
};





export const deleteStore = async (req, res) => {
  try {
    const { branchId, storeId } = req.params;

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    branch.stores = branch.stores.filter(s => s !== null);

    const store = branch.stores.find(s => s._id.toString() === storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    branch.stores = branch.stores.filter(s => s._id.toString() !== storeId);

    await branch.save();

    res.json({ message: "Store deleted" });
  } catch (err) {
    console.error("Delete store error:", err);
    res.status(500).json({ message: err.message });
  }
};


