import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { __categoryapiurl } from "../../../../API_URL";

export default function AddCategory() {
  const [category, setCategory] = useState({
    categoryName: "",
    isSubCategory: false,
    isGramBased: false,
    isInList: true,
    categoryImage: null,
    subCategories: [],
  });
  const [preview, setPreview] = useState(null);
  const [subCatInput, setSubCatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && !file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be under 2MB");
      return;
    }

    setCategory({ ...category, categoryImage: file });
    setPreview(URL.createObjectURL(file));
  };

  const addSubCategory = () => {
    if (subCatInput.trim()) {
      setCategory((prev) => ({
        ...prev,
        subCategories: [...prev.subCategories, { name: subCatInput.trim() }],
      }));
      setSubCatInput("");
    } else {
      toast.warning("Subcategory name cannot be empty");
    }
  };

  const removeSubCategory = (index) => {
    setCategory((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (category.isSubCategory && category.subCategories.length === 0) {
      toast.error("Please add at least one subcategory");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("categoryName", category.categoryName);
      formData.append("isSubCategory", category.isSubCategory.toString());
      formData.append("isGramBased", category.isGramBased.toString());
      formData.append("isInList", category.isInList.toString());

      if (category.categoryImage) {
        formData.append("categoryImage", category.categoryImage);
      }

      formData.append("subCategories", JSON.stringify(category.subCategories));

      const res = await fetch(__categoryapiurl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add category");

      toast.success("Category added successfully!");

    
      setCategory({
        categoryName: "",
        isSubCategory: false,
        isGramBased: false,
        isInList: true,
        categoryImage: null,
        subCategories: [],
      });
      setPreview(null);
      setSubCatInput("");

      navigate("/category");
    } catch (err) {
      console.error(err);
      toast.error("Error adding category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-success text-white text-center rounded-top-4">
          <h3 className="mb-0">Add New Category</h3>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Category Name */}
            <div className="mb-3">
              <label className="form-label fw-bold">Category Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter category name"
                value={category.categoryName}
                onChange={(e) =>
                  setCategory({ ...category, categoryName: e.target.value })
                }
                required
              />
            </div>

            {/* Options */}
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={category.isSubCategory}
                    onChange={(e) =>
                      setCategory({
                        ...category,
                        isSubCategory: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label fw-semibold">
                    Has Subcategories
                  </label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={category.isGramBased}
                    onChange={(e) =>
                      setCategory({
                        ...category,
                        isGramBased: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label fw-semibold">
                    Gram Based
                  </label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={category.isInList}
                    onChange={(e) =>
                      setCategory({
                        ...category,
                        isInList: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label fw-semibold">
                    Show in List
                  </label>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-3">
              <label className="form-label fw-bold">Category Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            {preview && (
              <div className="mb-3 text-center">
                <img
                  src={preview}
                  alt="preview"
                  className="rounded shadow-sm"
                  style={{
                    width: "220px",
                    height: "140px",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            {/* Subcategories */}
            {category.isSubCategory && (
              <div className="mb-3">
                <label className="form-label fw-bold">Subcategories</label>
                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter subcategory name"
                    value={subCatInput}
                    onChange={(e) => setSubCatInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={addSubCategory}
                  >
                    Add
                  </button>
                </div>

                {/* Subcategory list */}
                <div className="d-flex flex-wrap gap-2">
                  {category.subCategories.map((sub, i) => (
                    <span
                      key={i}
                      className="badge bg-secondary d-flex align-items-center gap-2"
                      style={{ padding: "0.6em 0.8em" }}
                    >
                      {sub.name}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-1"
                        style={{ fontSize: "0.6rem" }}
                        onClick={() => removeSubCategory(i)}
                      />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="text-center mt-4">
              <button
                type="submit"
                className="btn btn-success px-5 py-2 fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                ) : (
                  "Add Category"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
