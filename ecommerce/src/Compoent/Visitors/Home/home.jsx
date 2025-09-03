import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-5 text-center" style={{ maxWidth: "500px" }}>
        <h1 className="mb-4 text-primary fw-bold">Welcome to E-Commerce</h1>
        <p className="mb-4 text-muted">
          Manage your store, products, and orders with ease.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/register" className="btn btn-outline-primary btn-lg">
            Register
          </Link>
          <Link to="/login" className="btn btn-primary btn-lg">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
