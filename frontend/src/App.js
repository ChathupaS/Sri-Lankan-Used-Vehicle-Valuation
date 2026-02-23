import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import PredictionForm from "./components/PredictionForm";
import ResultCard from "./components/ResultCard";

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

  return (
    <div className="app-container">
      <Header />

      <div className="main-content">
        <div className="form-panel">
          <PredictionForm
            formData={formData}
            options={options}
            isLoading={isLoading}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>

        <div className="result-panel">
          {result ? (
            <ResultCard result={result} formData={formData} />
          ) : (
            <div className="result-placeholder">
              <div className="result-placeholder-icon">🚗</div>
              <h3>Your Valuation Awaits</h3>
              <p>
                Fill in the vehicle details on the left and click Calculate to
                see the estimated market value.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
