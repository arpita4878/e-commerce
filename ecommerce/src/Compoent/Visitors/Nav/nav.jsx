import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch("http://localhost:8001/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div className="container-fluid nav-bar bg-light shadow-sm">
      <div className="container">
        <nav className="navbar navbar-light navbar-expand-lg py-3">
          <Link to="/" className="navbar-brand">
            <h1 className="text-primary fw-bold mb-0">
              🛒 E-<span className="text-dark">Commerce</span>
            </h1>
          </Link>

          <button
            className="navbar-toggler py-2 px-3"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
          >
            <span className="fa fa-bars text-primary"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav mx-auto d-flex align-items-center">
              <Link to="/" className="nav-item nav-link">Home</Link>
              <Link to="/products" className="nav-item nav-link">Products</Link>

              {/* 🔎 Search */}
              <div className="position-relative mx-3">
                <input
                  type="text"
                  className="form-control rounded-pill px-3"
                  placeholder="Search for products..."
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      navigate(`/products?search=${encodeURIComponent(query)}`);
                      setSuggestions([]);
                    }
                  }}
                  style={{ minWidth: "250px" }}
                />

                {suggestions.length > 0 && (
                  <ul
                    className="list-group position-absolute w-100 shadow"
                    style={{ top: "100%", zIndex: 1000 }}
                  >
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="list-group-item list-group-item-action"
                        onClick={() => {
                          setQuery(s);
                          setSuggestions([]);
                          navigate(`/products?search=${encodeURIComponent(s)}`);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Role-based links */}
              {user?.role === "super_admin" && (
                <>
                  <Link to="/orders" className="nav-item nav-link">Orders</Link>
                  <Link to="/branch" className="nav-item nav-link">Branch</Link>
                  <Link to="/users" className="nav-item nav-link">Users</Link>

                  {/* Dropdown for Product */}
                  <li className="nav-item dropdown">
                    <span
                      className="nav-link dropdown-toggle"
                      id="productDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{ cursor: "pointer" }}
                    >
                      Product
                    </span>
                    <ul className="dropdown-menu" aria-labelledby="productDropdown">
                      <li><Link to="/product" className="dropdown-item">All Products</Link></li>
                      <li><Link to="/brand" className="dropdown-item">Brands</Link></li>
                      <li><Link to="/category" className="dropdown-item">Categories</Link></li>
                    </ul>
                  </li>
                </>
              )}

              {user?.role === "branch_admin" && (
                <>
                  <Link to="/orders" className="nav-item nav-link">Branch Orders</Link>
                  <Link to="/staff" className="nav-item nav-link">Manage Staff</Link>
                </>
              )}

              {user?.role === "staff" && (
                <>
                  <Link to="/orders" className="nav-item nav-link">My Orders</Link>
                  <Link to="/inventory" className="nav-item nav-link">Inventory</Link>
                </>
              )}

              {user?.role === "delivery_boy" && (
                <Link to="/my-deliveries" className="nav-item nav-link">My Deliveries</Link>
              )}

              {!user && (
                <Link to="/register" className="nav-item nav-link">Register</Link>
              )}
            </div>

            <div className="d-flex align-items-center">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="btn btn-danger py-2 px-4 rounded-pill"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary py-2 px-4 rounded-pill"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
