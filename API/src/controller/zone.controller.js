import Branch from "../model/branch.schema.js";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon as turfPolygon } from '@turf/helpers';
import * as turf from "@turf/turf";




export const checkDeliveryAvailability = async (req, res) => {
  try {
    const { branchId, storeId } = req.params;
    const { lat, lng } = req.body; 

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const store = branch.stores.id(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    // Customer point
    const point = turf.point([lng, lat]);

    // Check all zones
    for (const zone of store.zones) {
      const polygon = turf.polygon([zone.polygon]); // polygon = [[lng,lat], [lng,lat]...]
      const inside = turf.booleanPointInPolygon(point, polygon);

      if (inside) {
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

// Update a zone
export const updateZone = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const store = branch.stores.id(req.params.storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    const zone = store.zones.id(req.params.zoneId);
    if (!zone) return res.status(404).json({ message: "Zone not found" });

    Object.assign(zone, req.body);
    await branch.save();

    res.json(zone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a zone
export const deleteZone = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const store = branch.stores.id(req.params.storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    const zone = store.zones.id(req.params.zoneId);
    if (!zone) return res.status(404).json({ message: "Zone not found" });

    zone.remove();
    await branch.save();

    res.json({ message: "Zone deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Optional: Check if a customer point is inside a zone
export const checkCustomerInZone = (customerLng, customerLat, zone) => {
  const customerPt = point([customerLng, customerLat]);
  const zonePoly = turfPolygon(zone.polygon.coordinates);
  return booleanPointInPolygon(customerPt, zonePoly);
}