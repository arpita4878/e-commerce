import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { __productapiurl } from "../../../../API_URL";

type Product = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  brand?: string;
  images?: string[];
  attributes?: Record<string, string>;
  keywords?:string[]
};

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(__productapiurl);
        const data = await response.json();

        setProducts(data.items || []);

      
        const uniqueBrands = [
          ...new Set((data.items || []).map((p: Product) => p.brand)),
        ].filter(Boolean);
        setBrands(uniqueBrands);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

 
  let filteredProducts = products;

  if (selectedBrand !== "All") {
    filteredProducts = filteredProducts.filter(
      (p) => p.brand === selectedBrand
    );
  }

  if (searchQuery) {
  filteredProducts = filteredProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery) ||
      p.brand?.toLowerCase().includes(searchQuery) ||
      p.description?.toLowerCase().includes(searchQuery) ||
      (p.keywords && p.keywords.some((kw) => kw.toLowerCase().includes(searchQuery)))
  );
}


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-4 bg-light">
      <div className="container-fluid">
        <div className="row">
          {/* ✅ Sidebar Filters */}
          <div className="col-md-3 col-lg-2 border-end bg-white p-3 shadow-sm">
            <h5 className="fw-bold mb-3">Filter by Brand</h5>
            <ul className="list-group">
              <li
                className={`list-group-item ${
                  selectedBrand === "All" ? "active" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedBrand("All")}
              >
                All Brands
              </li>
              {brands.map((brand) => (
                <li
                  key={brand}
                  className={`list-group-item ${
                    selectedBrand === brand ? "active" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedBrand(brand)}
                >
                  {brand}
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Products Grid */}
          <div className="col-md-9 col-lg-10">
            <h3 className="fw-bold text-dark mb-4 text-center">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedBrand !== "All"
                ? `${selectedBrand} Products`
                : "All Products"}
            </h3>

            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted">No products available.</p>
            ) : (
              <div className="row g-4">
                {filteredProducts.map((product, index) => (
                  <div className="col-lg-3 col-md-4 col-sm-6" key={product._id}>
                    <div className="card h-100 border border-2 rounded-3 bg-white shadow-sm">
                      {/* ✅ Carousel */}
                      <div
                        id={`carousel-${index}`}
                        className="carousel slide"
                        data-bs-ride="carousel"
                      >
                        <div className="carousel-inner">
                          {product.images && product.images.length > 0 ? (
                            product.images.map((img, idx) => (
                              <div
                                className={`carousel-item ${
                                  idx === 0 ? "active" : ""
                                }`}
                                key={idx}
                              >
                                <img
                                  src={img}
                                  className="d-block w-100"
                                  alt={`${product.name}-${idx}`}
                                  style={{
                                    height: "300px",
                                    objectFit: "contain",
                                    background: "#f8f9fa",
                                    borderBottom: "1px solid #000",
                                  }}
                                />
                              </div>
                            ))
                          ) : (
                            <div
                              className="d-flex justify-content-center align-items-center text-muted"
                              style={{ height: "300px" }}
                            >
                              No Image
                            </div>
                          )}
                        </div>

                        {/* ✅ Carousel Controls */}
                        {product.images && product.images.length > 1 && (
                          <>
                            <button
                              className="carousel-control-prev"
                              type="button"
                              data-bs-target={`#carousel-${index}`}
                              data-bs-slide="prev"
                            >
                              <span
                                className="carousel-control-prev-icon bg-dark rounded-circle"
                                aria-hidden="true"
                              ></span>
                            </button>
                            <button
                              className="carousel-control-next"
                              type="button"
                              data-bs-target={`#carousel-${index}`}
                              data-bs-slide="next"
                            >
                              <span
                                className="carousel-control-next-icon bg-dark rounded-circle"
                                aria-hidden="true"
                              ></span>
                            </button>
                          </>
                        )}
                      </div>

                      {/* ✅ Card Body */}
                      <div className="card-body text-center">
                        <h6 className="fw-bold text-primary">{product.name}</h6>
                        <p className="text-muted small">
                          {product.description?.slice(0, 60) ||
                            "No description"}
                          {product.description &&
                          product.description.length > 60
                            ? "..."
                            : ""}
                        </p>

                        <small className="text-muted d-block mb-2">
                          Brand: {product.brand || "N/A"}
                        </small>
<br />  

                        <div className="d-flex justify-content-center gap-2 mt-2">
                          <button className="btn btn-outline-primary btn-sm">
                            View
                          </button>
                          <button className="btn btn-dark btn-sm">
                            🛒 Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
