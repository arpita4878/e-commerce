import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { __brandapiurl, backendBaseUrl } from "../../../../API_URL";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BrandList() {
  const [brands, setBrands] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // New brand state
  const [newBrand, setNewBrand] = useState({
    brandName: "",
    isInList: true,
    image: null,
  });
  const [preview, setPreview] = useState(null);

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const res = await fetch(__brandapiurl);
      const data = await res.json();
      setBrands(data.data || data || []);
    } catch (err) {
      toast.error("Error fetching brands");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBrand({ ...newBrand, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // Add new brand
  const addBrand = async (e) => {
    e.preventDefault();
    if (!newBrand.brandName.trim()) {
      toast.warning("Brand name is required");
      return;
    }
    if (!newBrand.image) {
      toast.warning("Please select an image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("brandName", newBrand.brandName);
      formData.append("isInList", newBrand.isInList);
      formData.append("image", newBrand.image);

      const res = await fetch(__brandapiurl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add brand");

      const data = await res.json();
      setBrands((prev) => [...prev, data.data || data]);
      toast.success("Brand added successfully");

      // reset form
      setNewBrand({ brandName: "", isInList: true, image: null });
      setPreview(null);
    } catch (err) {
      toast.error("Error adding brand");
    }
  };

  // Delete brand
  const handleDelete = async () => {
    try {
      await fetch(`${__brandapiurl}${deleteId}`, { method: "DELETE" });
      setBrands((prev) => prev.filter((b) => b._id !== deleteId));
      toast.success("Brand deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Error deleting brand");
    }
  };

  // Toggle brand visibility
  const toggleInList = async (id, currentValue) => {
    try {
      await fetch(`${__brandapiurl}${id}`, {
        method: "PUT",
        body: JSON.stringify({ isInList: !currentValue }),
        headers: { "Content-Type": "application/json" },
      });

      setBrands((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, isInList: !currentValue } : b
        )
      );

      toast.info("Brand visibility updated");
    } catch (err) {
      toast.error("Error updating brand visibility");
    }
  };

  // 🔍 Filter brands by search term
  const filteredBrands = brands.filter((brand) =>
    brand.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center fw-bold">Brand Management</h2>

      {/* 🔍 SEARCH BAR */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by brand name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ADD BRAND FORM */}
      <div className="card shadow-sm mb-5 p-4">
        <h4 className="mb-3 fw-bold"> Add New Brand</h4>
        <form onSubmit={addBrand} encType="multipart/form-data">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">Brand Name</label>
              <input
                type="text"
                className="form-control"
                value={newBrand.brandName}
                onChange={(e) =>
                  setNewBrand({ ...newBrand, brandName: e.target.value })
                }
              />
            </div>
            <div className="col-md-4 d-flex align-items-center">
              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={newBrand.isInList}
                  onChange={(e) =>
                    setNewBrand({ ...newBrand, isInList: e.target.checked })
                  }
                />
                <label className="form-check-label ms-2">Show in List</label>
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Upload Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {preview && (
            <div className="mt-3 text-center">
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "180px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}

          <button type="submit" className="btn btn-success mt-3 px-4">
            Add Brand
          </button>
        </form>
      </div>

      {/* BRAND LIST */}
      <div className="card shadow-sm p-4">
        <h4 className="mb-3 fw-bold">Brand List</h4>
        <table className="table table-bordered table-hover align-middle w-100">
          <thead className="table-dark text-center">
            <tr>
              <th style={{ width: "30%" }}>Brand</th>
              <th style={{ width: "15%" }}>In List</th>
              <th style={{ width: "25%" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.map((brand) => (
              <tr key={brand._id} className="text-center">
                {/* Brand with Image */}
                <td className="fw-bold text-start">
                  <div className="d-flex align-items-center gap-3">
                    {brand.image && (
                      <img
                        src={backendBaseUrl + brand.image}
                        alt={brand.brandName}
                        style={{
                          width: "70px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "5px",
                          border: "1px solid #ddd",
                        }}
                      />
                    )}
                    {brand.brandName}
                  </div>
                </td>

                {/* Toggle Switch */}
                <td>
                  <div className="form-check form-switch d-flex justify-content-center">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={brand.isInList}
                      onChange={() => toggleInList(brand._id, brand.isInList)}
                    />
                  </div>
                </td>

                {/* Action buttons */}
                <td>
                  <div className="d-flex justify-content-center gap-2">
                    <Link
                      to={`/brand/${brand._id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      ✏ Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(brand._id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredBrands.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted py-4">
                  No brands found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button className="btn-close" onClick={() => setDeleteId(null)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this brand?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
