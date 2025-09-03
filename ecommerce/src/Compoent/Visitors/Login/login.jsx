import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { __userapiurl } from "../../../../API_URL";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const validateForm = () => {
    let newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

  
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  //console.log(email, password);

  if (validateForm()) {
    setLoading(true);
    try {
      const response = await axios.post(`${__userapiurl}login`, {
        email,
        password,
      });

      console.log(response.data);

    
      localStorage.setItem("token", response.data.data.token);

      const userInfo = {
        _id: response.data.data.user._id,
        email: response.data.data.user.email,
        role: response.data.data.user.role,
        name: response.data.data.user.name,
      };
      localStorage.setItem("user", JSON.stringify(userInfo));
       localStorage.setItem("branch", response.data.data.user.branch);

      const userRole = response.data.data.user.role;
      if (userRole === "super_admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "branch_admin") {
        navigate("/branch-dashboard");
      } else if (userRole === "staff") {
        navigate("/staff-dashboard");
      } else if (userRole === "delivery_boy") {
        navigate("/delivery-dashboard");
      }

    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error);
      setErrors({
        ...errors,
        general: "Invalid credentials, please check email or password.",
      });
    }
  }
};

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center bg-light" style={{ minHeight: "100vh", paddingTop: "100px" }}>
      <div className="row w-100 shadow-lg rounded-4 overflow-hidden bg-white" style={{ maxWidth: "900px" }}>
        {/* Left Side (Form) */}
        <div className="col-md-6 p-5">
          <h2 className="fw-bold text-primary mb-4 text-center">Welcome Back</h2>
          <p className="text-muted text-center mb-4">
            Log in to manage your{" "}
            <span className="fw-semibold">Orders, Products & Reports</span>.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className={`form-control rounded-pill p-3 ${errors.email ? "is-invalid" : ""}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className={`form-control rounded-pill p-3 ${errors.password ? "is-invalid" : ""}`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="alert alert-danger" role="alert">
                {errors.general}
              </div>
            )}

            {/* Forgot Password */}
            <div className="d-flex justify-content-end mb-3">
              <Link
                to="/forgot-password"
                className="text-primary text-decoration-none small fw-semibold"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-pill fw-semibold"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1" />
            <span className="mx-2 text-muted">OR</span>
            <hr className="flex-grow-1" />
          </div>

          {/* Social Buttons */}
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-outline-dark rounded-pill px-4">
              <i className="fab fa-google me-2"></i> Google
            </button>
            <button className="btn btn-outline-primary rounded-pill px-4">
              <i className="fab fa-facebook-f me-2"></i> Facebook
            </button>
          </div>

          {/* Redirect to Register */}
          <p className="text-center mt-4">
            Don’t have an account?{" "}
            <Link to="/register" className="fw-semibold text-primary text-decoration-none">
              Register
            </Link>
          </p>
        </div>

        {/* Right Side (Illustration) */}
        <div className="col-md-6 d-none d-md-flex bg-primary text-white flex-column justify-content-center align-items-center p-5">
          <h3 className="fw-bold mb-3">Hello Again!</h3>
          <p className="text-center">
            Access your dashboard, manage products, and track orders with ease.
          </p>
          <img
            src="https://cdn-icons-png.flaticon.com/512/2920/2920244.png"
            alt="Login Illustration"
            className="img-fluid mt-4"
            style={{ maxWidth: "250px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
