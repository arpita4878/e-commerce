import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { __categoryapiurl } from "../../../../API_URL";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch(__categoryapiurl);
      const data = await res.json();
      setCategories(data.data || data || []);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    try {
      await fetch(`${__categoryapiurl}${deleteId}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Error deleting category", err);
    }
  };

  const filtered = categories.filter((c) =>
    c.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Category Management</h2>
        <Link to="/category/add" className="btn btn-success">
           Add Category
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Category Table */}
      <table className="table table-bordered table-hover shadow-sm">
        <thead className="table-dark text-center">
          <tr>
            <th>Name</th>
            <th>In List</th>
            <th>Image</th>
            <th style={{ width: "20%" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((cat) => (
            <tr key={cat._id} className="text-center">
              <td className="fw-bold">{cat.categoryName}</td>
              <td>{cat.isInList ? "Yes" : " No"}</td>
              <td>
                {cat.categoryImage && (
                  <img
                    src={cat.categoryImage}
                    alt={cat.categoryName}
                    style={{
                      width: "60px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                )}
              </td>
              <td>
                <div className="d-flex justify-content-center gap-2">
                  <Link
                    to={`/category/edit/${cat._id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                     Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(cat._id)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    🗑 Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted py-3">
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this category?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                >
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
