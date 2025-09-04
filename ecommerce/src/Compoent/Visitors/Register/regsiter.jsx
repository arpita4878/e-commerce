import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { __userapiurl } from "../../../../API_URL";
import { __branchapiurl } from "../../../../API_URL";

function Register() {
  const [designation, setDesignation] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [nationality, setNationality] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("supermarket_customer"); 
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!surname.trim()) newErrors.surname = "Surname is required";
    if (!phone) newErrors.phone = "Phone is required";

    // Email + password required only for online_customer
    if (role === "online_customer") {
      if (!email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";

      if (!password) newErrors.password = "Password is required";
      else if (password.length < 6)
        newErrors.password = "Password must be at least 6 characters";

      if (password !== confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const res = await axios.post(`${__userapiurl}register`, {
        designation,
        name,
        surname,
        email: role === "online_customer" ? email : null,
        phone,
        birthday,
        nationality,
        password: role === "online_customer" ? password : null,
        confirmPassword: role === "online_customer" ? confirmPassword : null,
        role,
        branch: branch || null,
      });

      if (res.data.status) {
        setMessage("Registered successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(res.data.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Server error");
    }
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`${__branchapiurl}`);
        setBranches(res.data.branches || []);
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };
    fetchBranches();
  }, []);

  return (
    <div
      className="container-fluid d-flex align-items-center justify-content-center bg-light"
      style={{ minHeight: "100vh", paddingTop: "50px" }}
    >
      <div
        className="row w-100 shadow-lg rounded-4 overflow-hidden bg-white"
        style={{ maxWidth: "800px" }}
      >
        <div className="col-12 p-5">
          <h2 className="fw-bold text-primary mb-4 text-center">
            Create Your Account
          </h2>

          {message && (
            <div
              className={`alert ${
                message.includes("successfully") ? "alert-success" : "alert-danger"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Designation</label>
              <input
                type="text"
                className="form-control rounded-pill p-3"
                placeholder="Enter designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">First Name</label>
              <input
                type="text"
                className={`form-control rounded-pill p-3 ${
                  errors.name ? "is-invalid" : ""
                }`}
                placeholder="Enter first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Surname</label>
              <input
                type="text"
                className={`form-control rounded-pill p-3 ${
                  errors.surname ? "is-invalid" : ""
                }`}
                placeholder="Enter surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
              {errors.surname && (
                <div className="invalid-feedback">{errors.surname}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Phone</label>
              <input
                type="tel"
                className={`form-control rounded-pill p-3 ${
                  errors.phone ? "is-invalid" : ""
                }`}
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Birthday</label>
              <input
                type="date"
                className="form-control rounded-pill p-3"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Nationality</label>
              <input
                type="text"
                className="form-control rounded-pill p-3"
                placeholder="Enter nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>

            {role === "online_customer" && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className={`form-control rounded-pill p-3 ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    className={`form-control rounded-pill p-3 ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Confirm Password</label>
                  <input
                    type="password"
                    className={`form-control rounded-pill p-3 ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold">Register As</label>
              <select
                className="form-select rounded-pill p-3"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="supermarket_customer">Supermarket Customer</option>
                <option value="online_customer">Online Customer</option>
              
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Branch</label>
              <select
                className="form-select rounded-pill p-3"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="">Select a branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-pill fw-semibold"
            >
              Register
            </button>
          </form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="fw-semibold text-primary text-decoration-none"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
