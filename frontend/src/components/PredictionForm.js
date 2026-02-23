import React from "react";
import "./PredictionForm.css";

const PredictionForm = ({
  formData,
  options,
  isLoading,
  handleInputChange,
  handleSubmit,
}) => {
  const currentAvailableModels = options.brand_model_map[formData.brand] || [];

  return (
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
            disabled={currentAvailableModels.length === 0}
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
        {isLoading ? (
          <span className="loading-text">
            <span className="spinner"></span> Processing...
          </span>
        ) : (
          "Calculate Estimated Price"
        )}
      </button>
    </form>
  );
};

export default PredictionForm;
