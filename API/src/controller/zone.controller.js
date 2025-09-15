import Branch from "../model/branch.schema.js";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon as turfPolygon } from '@turf/helpers';
import * as turf from "@turf/turf";

export const checkDeliveryAvailability = async (req, res) => {
  try {
    const { branchId, storeId } = req.params;
    let { lat, lng } = req.body;

    console.log("Incoming coords:", lat, lng, typeof lat, typeof lng);

    // Convert to numbers
    lat = parseFloat(lat);
    lng = parseFloat(lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Invalid coordinates: must be numbers" });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const store = branch.stores.id(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    // Customer point
    const customerPt = point([lng, lat]);

    // Check zones
    for (const zone of store.zones) {
      const zonePoly = turfPolygon(zone.polygon.coordinates);
      if (booleanPointInPolygon(customerPt, zonePoly)) {
        return res.json({
          available: true,
          zoneId: zone._id,
          deliveryTime: zone.deliveryTime,
          deliveryCharge: zone.deliveryCharge,
          minOrder: zone.minOrderValue
        });
      }
    }

    res.json({ available: false, message: "Not deliverable in this location" });
  } catch (err) {
    console.error("Error in checkDeliveryAvailability:", err);
    res.status(500).json({ message: err.message });
  }
};






// Add a zone to a store
export const addZone = async (req, res) => {
  try {
    const { name, polygon, freeDeliveryAbove, minOrderValue, deliveryTime, deliveryCharge, deliveryChargeAfterKm, paymentMethods } = req.body;
    if (!name || !polygon || !polygon.coordinates) return res.status(400).json({ message: "Zone name and polygon required" });

    const branch = await Branch.findById(req.params.branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const store = branch.stores.id(req.params.storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    // Validate polygon (at least 3 points)
    if (polygon.coordinates[0].length < 3) return res.status(400).json({ message: "Polygon must have at least 3 points" });

    store.zones.push({ name, polygon, freeDeliveryAbove, minOrderValue, deliveryTime, deliveryCharge, deliveryChargeAfterKm, paymentMethods });
    await branch.save();

    res.status(201).json(store.zones[store.zones.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const updateZone = async (req, res) => {
  try {
    const { branchId, storeId, zoneId } = req.params;

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const store = branch.stores.id(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    const zone = store.zones.id(zoneId);
    if (!zone) return res.status(404).json({ message: "Zone not found" });


    const allowedFields = [
      "name",
      "polygon",
      "freeDeliveryAbove",
      "minOrderValue",
      "deliveryTime",
      "deliveryCharge",
      "deliveryChargeAfterKm",
      "paymentMethods",
    ];

    let updated = false;
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        zone[field] = req.body[field];
        updated = true;
      }
    });

    if (!updated) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Mark zones array as modified so Mongoose saves changes
    store.markModified("zones");

    await branch.save();

    res.json(zone);
  } catch (err) {
    console.error("Update zone error:", err);
    res.status(500).json({ message: err.message });
  }
};


// Delete a zone
// Delete a zone
export const deleteZone = async (req, res) => {
  try {
    const { branchId, storeId, zoneId } = req.params;

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const store = branch.stores.id(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    const zone = store.zones.id(zoneId);
    if (!zone) return res.status(404).json({ message: "Zone not found" });

    
    store.zones = store.zones.filter(z => z._id.toString() !== zoneId);

    store.markModified("zones");

    await branch.save();

    res.json({ message: "Zone deleted" });
  } catch (err) {
    console.error("Delete zone error:", err);
    res.status(500).json({ message: err.message });
  }
};



