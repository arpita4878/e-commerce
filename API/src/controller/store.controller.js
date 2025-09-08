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


// Update a store
export const updateStore = async (req, res) => {
  try {
    const { branchId, storeId } = req.params;

    // Find the branch
    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    // Find the store inside branch
    const store = branch.stores.id(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    // Update only allowed fields
    const allowedFields = ["name", "isOpen", "openTime", "closeTime"];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefinexd) {
        store[field] = req.body[field];
      }
    });

    // Save the branch
    await branch.save();

    res.json(store);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};




// Delete a store
export const deleteStore = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const store = branch.stores.id(req.params.storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    store.remove();
    await branch.save();

    res.json({ message: "Store deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

