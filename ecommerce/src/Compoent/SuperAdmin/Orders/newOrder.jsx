"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { __orderapiurl } from "../../../../API_URL";

const ENDPOINTS = {
  "new": "new",
  "under-process": "under-process",
  "out-for-delivery": "out-for-delivery",
  "delivered": "delivered",
  "pending-confirm": "pending-confirm",
  "delivered-missing": "delivered-missing",
  "cancel-order": "cancel-order",
};

const ORDER_STATUSES = [
  { key: "new", label: " New Orders" },
  { key: "under-process", label: " Under Process" },
  { key: "out-for-delivery", label: "Out for Delivery" },
  { key: "delivered", label: " Delivered" },
  { key: "pending-confirm", label: " Pending Confirm" },
  { key: "delivered-missing", label: " Delivered Missing" },
  { key: "cancel-order", label: " Cancelled" },
];

function OrderCard({ order }) {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between">
          <h5 className="card-title mb-0">OID: {order._id}</h5>
          <small className="text-muted">
            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
          </small>
        </div>
        <p className="fw-semibold mt-2">{order.customer?.name || "Unknown"}</p>
        <p className="text-muted mb-1">{order.customer?.address || "No Address"}</p>
        <p className="fw-bold text-end">₹{order.total}</p>
      </div>
    </div>
  );
}

export default function OrdersDashboard() {
  const [activeTab, setActiveTab] = useState("new");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const endpoint = ENDPOINTS[status];
      const res = await fetch(`${__orderapiurl}${endpoint}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold">📦 Orders Dashboard</h2>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 flex-wrap">
        {ORDER_STATUSES.map((s) => (
          <li className="nav-item" key={s.key}>
            <button
              className={`nav-link ${activeTab === s.key ? "active" : ""}`}
              onClick={() => setActiveTab(s.key)}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Orders List */}
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : orders.length > 0 ? (
          orders.map((order) => <OrderCard key={order._id} order={order} />)
        ) : (
          <p className="text-muted">
            No {ORDER_STATUSES.find((s) => s.key === activeTab)?.label} orders
          </p>
        )}
      </div>
    </div>
  );
}
