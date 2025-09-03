import DeliveryZone from "../model/deliveryZone.schema.js";
import Branch from "../model/branch.schema.js";
import { haversineKm } from "../lib/geo.js";
// import fetch from "node-fetch"; // Node 18+ has global fetch; keep for clarity


export async function createDeliveryZone(req, res, next) {
  try {
    const { branchId, name, pricing, minOrderValue = 0, etaMinutes = 45 } = req.body;

    if (!branchId || !name) {
      return res.status(400).json({ message: "branchId and name are required" });
    }

    const zone = await DeliveryZone.create({
      branchId,
      name,
      pricing,
      minOrderValue,
      etaMinutes,
      isActive: true
    });

    res.status(201).json({ message: "Delivery zone created", zone });
  } catch (err) {
    next(err);
  }
}



export async function getDeliveryZones(req, res, next) {
  try {
    const zones = await DeliveryZone.find().populate("branchId", "name address");
    res.json({ zones });
  } catch (err) {
    next(err);
  }
}


export async function updateDeliveryZone(req, res, next) {
  try {
    const { id } = req.params;
    const { name, pricing, minOrderValue, etaMinutes, isActive } = req.body;

    const zone = await DeliveryZone.findByIdAndUpdate(
      id,
      { name, pricing, minOrderValue, etaMinutes, isActive },
      { new: true }
    );

    if (!zone) {
      return res.status(404).json({ message: "Delivery zone not found" });
    }

    res.json({ message: "Delivery zone updated", zone });
  } catch (err) {
    next(err);
  }
}


export async function deleteDeliveryZone(req, res, next) {
  try {
    const { id } = req.params;

    const zone = await DeliveryZone.findByIdAndDelete(id);

    if (!zone) {
      return res.status(404).json({ message: "Delivery zone not found" });
    }

    res.json({ message: "Delivery zone deleted", zone });
  } catch (err) {
    next(err);
  }
}



// // Find active zone whose polygon contains the point
// async function detectZone(branchId, customerPoint) {
//   return DeliveryZone.findOne({
//     branchId,
//     isActive: true,
//     polygon: { $geoIntersects: { $geometry: customerPoint } }
//   });
// }

// // Compute fee by pricing model
// function computeZoneFee(pricing, distanceKm) {
//   switch (pricing.type) {
//     case "flat":
//       return Math.max(0, pricing.baseFee || 0);
//     case "per_km":
//       return Math.max(0, (pricing.baseFee || 0) + (pricing.perKmFee || 0) * distanceKm);
//     case "bands": {
//       const band = (pricing.bands || []).find(b => distanceKm >= b.fromKm && distanceKm <= b.toKm);
//       return Math.max(0, band ? band.fee : (pricing.baseFee || 0));
//     }
//     default:
//       return 0;
//   }
// }

// // Optional: Google Directions (polyline, distance, duration)
// async function getGoogleRoute(origin, destination) {
//   const key = process.env.GOOGLE_MAPS_API_KEY;
//   if (!key) return null;
//   const originStr = `${origin[1]},${origin[0]}`;       // lat,lng
//   const destStr   = `${destination[1]},${destination[0]}`;
//   const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${key}`;
//   const resp = await fetch(url);
//   if (!resp.ok) return null;
//   const data = await resp.json();
//   const route = data.routes?.[0];
//   if (!route) return null;
//   const leg = route.legs?.[0];
//   return {
//     distanceMeters: leg?.distance?.value,
//     durationSeconds: leg?.duration?.value,
//     polyline: route.overview_polyline?.points
//   };
// }

// /**
//  * POST /delivery/quote
//  * Body: { branchId, customer: { location: { type:"Point", coordinates:[lng,lat] } }, cartTotal }
//  */
// export async function getDeliveryQuote(req, res, next) {
//   try {
//     const { branchId, customer, cartTotal = 0 } = req.body;
//     if (!branchId || !customer?.location?.coordinates) {
//       return res.status(400).json({ message: "branchId and customer.location required" });
//     }

//     const branch = await Branch.findById(branchId);
//     if (!branch) return res.status(404).json({ message: "Branch not found" });

//     const customerPoint = customer.location;
//     const zone = await detectZone(branchId, customerPoint);
//     if (!zone) {
//       return res.status(200).json({ available: false, reason: "Outside delivery zones" });
//     }

//     // distance branch->customer (straight line; we’ll also try Google route)
//     const distanceKm = haversineKm(branch.location.coordinates, customerPoint.coordinates);
//     const fee = computeZoneFee(zone.pricing, distanceKm);

//     if (cartTotal < (zone.minOrderValue || 0)) {
//       return res.status(200).json({
//         available: false,
//         reason: `Minimum order ₹${zone.minOrderValue} not met`,
//         minOrderValue: zone.minOrderValue
//       });
//     }

//     // Optional route details
//     const route = await getGoogleRoute(branch.location.coordinates, customerPoint.coordinates);

//     return res.json({
//       available: true,
//       zone: { id: zone._id, name: zone.name, etaMinutes: zone.etaMinutes },
//       fee,
//       distanceKm: Number(distanceKm.toFixed(2)),
//       route
//     });
//   } catch (err) { next(err); }
// }
