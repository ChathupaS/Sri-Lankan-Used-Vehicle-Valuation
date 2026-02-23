import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [options, setOptions] = useState({
    brands: [],
    brand_model_map: {},
    transmissions: [],
    fuel_types: [],
  });

  const [formData, setFormData] = useState({
    brand: "Toyota",
    car_model: "Premio",
    year: 2015,
    mileage: 50000,
    engine_cc: 1500,
    transmission: "Automatic",
    fuel_type: "Petrol",
  });

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch("http://localhost:8000/options");
        const data = await res.json();
        setOptions(data);
      } catch (error) {
        console.error("Error fetching options from API:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "brand") {
      const availableModelsForNewBrand = options.brand_model_map[value] || [];
      setFormData({
        ...formData,
        brand: value,
        car_model:
          availableModelsForNewBrand.length > 0
            ? availableModelsForNewBrand[0]
            : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: formData.brand,
          car_model: formData.car_model,
          year: Number(formData.year),
          mileage: Number(formData.mileage),
          engine_cc: Number(formData.engine_cc),
          transmission: formData.transmission,
          fuel_type: formData.fuel_type,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      alert("Failed to connect to the backend API.");
    }

    setIsLoading(false);
  };

  const currentAvailableModels = options.brand_model_map[formData.brand] || [];

  return (
    <div className="app-container">
      <div className="header">
        <h1>Sri Lankan Used Car Valuator</h1>
        <p>Advanced Machine Learning & Explainable AI (XAI)</p>
      </div>

      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Brand (Make)</label>
            <select
              name="brand"
              className="form-control"
              value={formData.brand}
              onChange={handleInputChange}
            >
              {options.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Specific Model</label>
            <select
              name="car_model"
              className="form-control"
              value={formData.car_model}
              onChange={handleInputChange}
            >
              {currentAvailableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Year of Manufacture</label>
            <input
              type="number"
              name="year"
              className="form-control"
              min="1990"
              max="2026"
              value={formData.year}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mileage (km)</label>
            <input
              type="number"
              name="mileage"
              className="form-control"
              min="0"
              max="500000"
              step="500"
              value={formData.mileage}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Engine Capacity (cc)</label>
            <input
              type="number"
              name="engine_cc"
              className="form-control"
              min="600"
              max="6000"
              step="100"
              value={formData.engine_cc}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Transmission</label>
            <select
              name="transmission"
              className="form-control"
              value={formData.transmission}
              onChange={handleInputChange}
            >
              {options.transmissions.map((trans) => (
                <option key={trans} value={trans}>
                  {trans}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fuel Type</label>
            <select
              name="fuel_type"
              className="form-control"
              value={formData.fuel_type}
              onChange={handleInputChange}
            >
              {options.fuel_types.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {fuel}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading
            ? "Processing Machine Learning Model..."
            : "Calculate Estimated Price"}
        </button>
      </form>

      {result && (
        <div className="result-card">
          <h2>Estimated Market Value</h2>
          <h1 className="price-display" style={{ marginBottom: "5px" }}>
            Rs.{" "}
            {result.predicted_price.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              color: "#666",
              marginTop: "0",
              fontWeight: "bold",
            }}
          >
            Fair Market Range: Rs.{" "}
            {result.lower_bound.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}{" "}
            - Rs.{" "}
            {result.upper_bound.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </p>

          <div
            style={{
              backgroundColor: "#fff3cd",
              color: "#856404",
              padding: "15px",
              borderRadius: "8px",
              margin: "25px 0",
              textAlign: "left",
              border: "1px solid #ffeeba",
            }}
          >
            <h4 style={{ marginTop: "0", marginBottom: "8px" }}>
              📉 1-Year Depreciation Projection
            </h4>
            <p style={{ margin: 0 }}>
              Thinking of holding onto this car? Based on market depreciation
              trends, if you wait one year to sell (adding ~15,000 km), the
              estimated value will drop to{" "}
              <strong>
                Rs.{" "}
                {result.future_price.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </strong>
              .
            </p>
          </div>

          {result.comps && result.comps.length > 0 && (
            <div style={{ textAlign: "left", margin: "30px 0" }}>
              <h4 style={{ marginBottom: "5px" }}>
                🔍 Market Comparables ("Comps")
              </h4>
              <p
                style={{
                  color: "#666",
                  marginTop: "0",
                  marginBottom: "15px",
                  fontSize: "0.9rem",
                }}
              >
                Actual similar vehicles currently listed on the market:
              </p>

              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                {result.comps.map((comp, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      backgroundColor: "#f8f9fa",
                      padding: "15px",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "1.1rem",
                      }}
                    >
                      {comp.year} {formData.brand} {formData.car_model}
                    </strong>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#555",
                        marginBottom: "10px",
                      }}
                    >
                      🛣️ {comp.mileage.toLocaleString()} km
                      <br />
                      ⚙️ {comp.transmission}
                    </div>
                    <strong style={{ color: "#28a745", fontSize: "1.2rem" }}>
                      Rs.{" "}
                      {comp.price.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr style={{ margin: "30px 0", borderTop: "1px solid #eee" }} />

          <div className="shap-section">
            <h3>Explainable AI (XAI) Logic Breakdown</h3>
            <p style={{ color: "#555", marginBottom: "20px" }}>
              How did the algorithm arrive at this price? The chart below shows
              how each specific feature of your vehicle pushed the price up
              (red) or down (blue) from the national market average.
            </p>
            <img
              src={`data:image/png;base64,${result.shap_image_base64}`}
              alt="SHAP Waterfall Explanation"
              className="shap-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
