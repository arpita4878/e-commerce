import React from "react";
import { useNavigate } from "react-router-dom";

type ManagerHomeProps = {
  managerName: string;
  branch: {
    name: string;
    location: string;
    contact: string;
  };
};

const ManagerHome: React.FC<ManagerHomeProps> = ({ managerName, branch }) => {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="fw-bold">Welcome, {managerName} 👋</h2>
        <p className="text-muted">Branch Manager Dashboard</p>
      </div>

      {/* Branch Info Card */}
      <div className="card mb-5 shadow-sm border-0">
        <div className="card-body">
          <h5 className="fw-bold mb-3">📍 Branch Information</h5>
          <p>
            <strong>Name:</strong> {branch.name}
          </p>
          <p>
            <strong>Location:</strong> {branch.location}
          </p>
          <p>
            <strong>Contact:</strong> {branch.contact}
          </p>
        </div>
      </div>

      {/* Dashboard Options */}
      <div className="row g-4">
        {/* Manage Products */}
        <div className="col-md-6 col-lg-3">
          <div
            className="card shadow-sm border-0 text-center h-100 p-4 dashboard-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/manager/products")}
          >
            <h4 className="fw-bold text-primary">📦 Manage Products</h4>
            <p className="text-muted">Add, update, or remove products</p>
          </div>
        </div>

        {/* Branch Orders */}
        <div className="col-md-6 col-lg-3">
          <div
            className="card shadow-sm border-0 text-center h-100 p-4 dashboard-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/manager/orders")}
          >
            <h4 className="fw-bold text-success">🛒 Branch Orders</h4>
            <p className="text-muted">View and manage branch orders</p>
          </div>
        </div>

        {/* Manage Staff */}
        <div className="col-md-6 col-lg-3">
          <div
            className="card shadow-sm border-0 text-center h-100 p-4 dashboard-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/manager/staff")}
          >
            <h4 className="fw-bold text-warning">👨‍💼 Manage Staff</h4>
            <p className="text-muted">Add or assign staff members</p>
          </div>
        </div>

        {/* Branch Details */}
        <div className="col-md-6 col-lg-3">
          <div
            className="card shadow-sm border-0 text-center h-100 p-4 dashboard-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/manager/branch")}
          >
            <h4 className="fw-bold text-danger">🏬 My Branch</h4>
            <p className="text-muted">View and update branch info</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerHome;
