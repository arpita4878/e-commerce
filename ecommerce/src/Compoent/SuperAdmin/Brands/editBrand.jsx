import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { __brandapiurl } from "../../../../API_URL";

export default function EditBrand() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchBrand = async () => {
    try {
      const res = await axios.get(`${__brandapiurl}${id}`);
      setBrand(res.data?.data || res.data);
     
      
    } catch (err) {
      console.error("Error fetching brand:", err);
    }
  };

  
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${__brandapiurl}${id}/products`);
      setProducts(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchBrand(), fetchProducts()]).finally(() =>
      setLoading(false)
    );
  }, [id]);

  // ✅ Save brand (with updated info)
  const handleSave = async () => {
    try {
      await axios.put(`${__brandapiurl}${id}`, brand, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Brand updated successfully!");
      navigate("/brands");
    } catch (err) {
      console.error("Error updating brand:", err);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading...</p>;

  return (
    <div className="container mt-4">
      <h2>Edit Brand</h2>
      {brand && (
        <div className="card shadow-sm p-4 mb-4">
          {/* Brand Name */}
          <div className="mb-3">
            <label className="form-label fw-bold">Brand Name</label>
            <input
              type="text"
              className="form-control"
              value={brand.brandName}
              onChange={(e) =>
                setBrand({ ...brand, brandName: e.target.value })
              }
            />
          </div>

          {/* In List */}
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="isInList"
              checked={brand.isInList}
              onChange={(e) =>
                setBrand({ ...brand, isInList: e.target.checked })
              }
            />
            <label className="form-check-label" htmlFor="isInList">
              Is in List
            </label>
          </div>

          {/* Image */}
          <div className="mb-3">
            <label className="form-label fw-bold">Brand Image</label>
            <div className="d-flex align-items-center gap-3">
              <img
                src={brand.image}
                alt="Brand"
                width="120"
                height="80"
                style={{ objectFit: "cover", borderRadius: "5px" }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Paste new image URL"
                value={brand.image}
                onChange={(e) => setBrand({ ...brand, image: e.target.value })}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex gap-3">
            <button onClick={handleSave} className="btn btn-success">
              Save
            </button>
            <button
              onClick={() => navigate("/brands")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products */}
      <h4>Products under this Brand</h4>
      {products.length > 0 ? (
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-light">
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>SKU</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <img
                    src={p.image}
                    alt={p.name}
                    width="80"
                    height="60"
                    style={{ objectFit: "cover", borderRadius: "5px" }}
                  />
                </td>
                <td>{p.name}</td>
                <td>₹{p.price}</td>
                <td>{p.sku}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted">No products found for this brand.</p>
      )}
    </div>
  );
}
