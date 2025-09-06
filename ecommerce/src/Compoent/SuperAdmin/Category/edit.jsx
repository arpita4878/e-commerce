import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { __categoryapiurl } from "../../../../API_URL";

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState({
categoryName:"",
isSubCategory:"",
subCategories :"",
isGramBased:false,
isInList:false,
categoryImagefile:null
  });
  const [preview, setPreview] = useState(null);
  const [subCatInput, setSubCatInput] = useState("");

  // Fetch category
  const fetchCategory = async () => {
    try {
      const res = await fetch(`${__categoryapiurl}?id=${id}`);
      const data = await res.json();
      setCategory({
        categoryName: data.data.categoryName,
        isSubCategory:data.data.isSubCategory,
        subCategories :data.data.subCategories ,
        isGramBased:data.data.isGramBased,
        isInList:data.data.isInList,
        categoryImagefile:null
     } );
      console.log(data.data);
      
      setPreview(data.data.image || null)
    } catch (err) {
      toast.error("Failed to load category");
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCategory({ ...category, categoryImage: file });
    setPreview(URL.createObjectURL(file));
  };

  // Add subcategory locally
  const addSubCategory = () => {
    if (subCatInput.trim()) {
      setCategory({
        ...category,
        subCategories: [...(category.subCategories || []), { name: subCatInput }],
      });
      setSubCatInput("");
    }
  };

  // Delete subcategory locally
  const deleteSubCategory = (index) => {
    const updated = category.subCategories.filter((_, i) => i !== index);
    setCategory({ ...category, subCategories: updated });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("categoryName", category.categoryName);
      formData.append("isSubCategory", category.isSubCategory.toString());
      formData.append("isGramBased", category.isGramBased.toString());
      formData.append("isInList", category.isInList.toString());

      if (category.categoryImage instanceof File) {
        formData.append("categoryImage", category.categoryImage);
      }

      if (category.isSubCategory) {
        formData.append("subCategories", JSON.stringify(category.subCategories));
      }

      const res = await fetch(`${__categoryapiurl}${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      toast.success("Category updated successfully!");
      navigate("/category");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!category) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="fw-bold mb-3 text-primary">✏ Edit Category</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Category Name */}
          <div className="mb-3">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              className="form-control"
              value={category.categoryName}
              onChange={(e) =>
                setCategory({ ...category, categoryName: e.target.value })
              }
              required
            />
          </div>

          {/* Toggles */}
          <div className="form-check mb-2">
            <input
              type="checkbox"
              className="form-check-input"
              checked={category.isSubCategory}
              onChange={(e) =>
                setCategory({ ...category, isSubCategory: e.target.checked })
              }
            />
            <label className="form-check-label">Has Subcategories</label>
          </div>
          <div className="form-check mb-2">
            <input
              type="checkbox"
              className="form-check-input"
              checked={category.isGramBased}
              onChange={(e) =>
                setCategory({ ...category, isGramBased: e.target.checked })
              }
            />
            <label className="form-check-label">Gram Based</label>
          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={category.isInList}
              onChange={(e) =>
                setCategory({ ...category, isInList: e.target.checked })
              }
            />
            <label className="form-check-label">Show in List</label>
          </div>

          {/* Image */}
          <div className="mb-3">
            <label className="form-label">Category Image</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="preview"
                style={{ width: "180px", borderRadius: "8px" }}
              />
            </div>
          )}

          {/* Subcategories */}
          {category.isSubCategory && (
            <div className="mb-3">
              <label className="form-label">Subcategories</label>
              <div className="d-flex mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={subCatInput}
                  onChange={(e) => setSubCatInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-success ms-2"
                  onClick={addSubCategory}
                >
                  ➕
                </button>
              </div>
              <ul className="list-group">
                {category.subCategories?.map((sub, i) => (
                  <li
                    key={i}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {sub.name}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteSubCategory(i)}
                    >
                      🗑 Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-4">
            <button type="submit" className="btn btn-primary">
              💾 Save Changes
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => navigate("/category")}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
