import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { __brandapiurl } from "../../../../API_URL";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { backendBaseUrl } from "../../../../API_URL";

export default function EditBrand() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [brand, setBrand] = useState({
    brandName: "",
    isInList: false,
    image: "",
    imageFile: null,
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchBrand = async () => {
    try {
      const res = await axios.get(`${__brandapiurl}${id}`);
     // console.log("Fetched Brand:", res.data);
      const data = res.data;
      setBrand({
        brandName: data.data.brandName || "",
        isInList: data.data.isInList || false,
        image: data.data.image || "",
        imageFile: null,
      });
      console.log(backendBaseUrl+brand.image)

      setSelectedImage(data.data.image || null);
      
    } catch (err) {
      console.error("Error fetching brand:", err);
    }
  };



  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${__brandapiurl}${id}/products`);
      setProducts(res.data?.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchBrand(), fetchProducts()]).finally(() =>
      setLoading(false)
    );
  }, [id]);

  // Handle image file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setBrand((prev) => ({
      ...prev,
      imageFile: file,
    }));
  };
  const handleSave = async () => {
    if (!id) {
      toast.error("Invalid brand ID. Cannot update.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("brandName", brand.brandName);
      formData.append("isInList", brand.isInList);
      if (brand.imageFile) {
        formData.append("image", brand.imageFile);
      }

      await axios.put(`${__brandapiurl}${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Brand updated successfully!");
      setTimeout(() => {
        navigate(`/brand/${id}`);
      }, 1500);
    } catch (err) {
      console.error("Error updating brand:", err.response?.data || err.message);
      toast.error("Error updating brand.");
    }
  };


  


  if (loading) return <p className="text-center mt-4">Loading...</p>;

  return (
    <div className="container mt-4">
      <h2>Edit Brand</h2>

      <div className="card shadow-sm p-4 mb-4">
        {/* Brand Name */}
        <div className="mb-3">
          <label className="form-label fw-bold">Brand Name</label>
          <input
            type="text"
            className="form-control"
            value={brand.brandName}
            onChange={(e) =>
              setBrand((prev) => ({ ...prev, brandName: e.target.value }))
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
              setBrand((prev) => ({ ...prev, isInList: e.target.checked }))
            }
          />
          <label className="form-check-label" htmlFor="isInList">
            Is in List
          </label>
        </div>

        {/* Image Upload */}
        <div className="mb-3">
          <label className="form-label fw-bold">Brand Image</label>
          <div className="d-flex align-items-center gap-3">
            {selectedImage && (

              <img
                 src={brand.image ? backendBaseUrl + brand.image : defaultPlaceholder} 
                alt="Brand"
                width="350"
                height="180"
                style={{ objectFit: "cover", borderRadius: "5px" }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={handleFileChange}
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

      {/* Products */}
      <h4>Products under this Brand</h4>
      {products.length > 0 ? (
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>SKU</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>₹{p.basePrice}</td>
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
