import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. Setup State for the API dropdown options
  const [options, setOptions] = useState({
    brands: [],
    brand_model_map: {}, // NEW: Store the dictionary mapping
    transmissions: [],
    fuel_types: []
  });

  // 2. Setup State for the User's Input
  const [formData, setFormData] = useState({
    brand: 'Toyota',
    car_model: 'Premio',
    year: 2015,
    mileage: 50000,
    engine_cc: 1500,
    transmission: 'Automatic',
    fuel_type: 'Petrol'
  });

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Fetch the available car options from FastAPI on page load
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch('http://localhost:8000/options');
        const data = await res.json();
        setOptions(data);
      } catch (error) {
        console.error("Error fetching options from API:", error);
      }
    };
    fetchOptions();
  }, []);

  // Handle typing/selecting in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If the user changes the Brand, we must reset the Model to fit the new Brand!
    if (name === 'brand') {
      const availableModelsForNewBrand = options.brand_model_map[value] || [];
      setFormData({ 
        ...formData, 
        brand: value, 
        car_model: availableModelsForNewBrand.length > 0 ? availableModelsForNewBrand[0] : '' 
      });
    } else {
      // Standard update for all other inputs
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null); 
    
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: formData.brand,
          car_model: formData.car_model,
          year: Number(formData.year),
          mileage: Number(formData.mileage),
          engine_cc: Number(formData.engine_cc),
          transmission: formData.transmission,
          fuel_type: formData.fuel_type
        })
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
        <h1>🚗 Sri Lankan Used Car Valuator</h1>
        <p>Advanced Machine Learning & Explainable AI (XAI)</p>
      </div>
      
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-grid">
          
          <div className="form-group">
            <label>Brand (Make)</label>
            <select name="brand" className="form-control" value={formData.brand} onChange={handleInputChange}>
              {options.brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Specific Model</label>
            {/* Update this select mapping to use currentAvailableModels */}
            <select name="car_model" className="form-control" value={formData.car_model} onChange={handleInputChange}>
              {currentAvailableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Year of Manufacture</label>
            <input type="number" name="year" className="form-control" min="1990" max="2026" value={formData.year} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Mileage (km)</label>
            <input type="number" name="mileage" className="form-control" min="0" max="500000" step="500" value={formData.mileage} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Engine Capacity (cc)</label>
            <input type="number" name="engine_cc" className="form-control" min="600" max="6000" step="100" value={formData.engine_cc} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Transmission</label>
            <select name="transmission" className="form-control" value={formData.transmission} onChange={handleInputChange}>
              {options.transmissions.map(trans => (
                <option key={trans} value={trans}>{trans}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fuel Type</label>
            <select name="fuel_type" className="form-control" value={formData.fuel_type} onChange={handleInputChange}>
              {options.fuel_types.map(fuel => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
            </select>
          </div>

        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Processing Machine Learning Model...' : 'Calculate Estimated Price'}
        </button>
      </form>

      {/* 5. Display the Results and the SHAP XAI Graph */}
      {result && (
        <div className="result-card">
          <h2>Estimated Market Value</h2>
          <h1 className="price-display">
            Rs. {result.predicted_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </h1>
          
          <div className="shap-section">
            <h3>Explainable AI (XAI) Logic Breakdown</h3>
            <p style={{ color: '#555', marginBottom: '20px' }}>
              How did the algorithm arrive at this price? The chart below shows how each specific feature of your vehicle pushed the price up (red) or down (blue) from the national market average.
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