import React from "react";
import "./ResultCard.css";

const ResultCard = ({ result, formData }) => {
  if (!result) return null;

  return (
    <div className="result-card">
      <div className="result-header">
        <h2>Estimated Market Value</h2>
        <h1 className="price-display">
          Rs.{" "}
          {result.predicted_price.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </h1>
        <p className="fair-market-range">
          Fair Market Range: Rs.{" "}
          {result.lower_bound.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}{" "}
          - Rs.{" "}
          {result.upper_bound.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </p>
      </div>

      <div className="depreciation-box">
        <div className="depreciation-icon">📉</div>
        <div className="depreciation-content">
          <h4>1-Year Depreciation Projection</h4>
          <p>
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
      </div>

      {result.comps && result.comps.length > 0 && (
        <div className="comps-section">
          <h4>🔍 Market Comparables ("Comps")</h4>
          <p className="comps-subtitle">
            Actual similar vehicles currently listed on the market:
          </p>

          <div className="comps-grid">
            {result.comps.map((comp, idx) => (
              <div key={idx} className="comp-card">
                <strong className="comp-title">
                  {comp.year} {formData.brand} {formData.car_model}
                </strong>
                <div className="comp-details">
                  <span>🛣️ {comp.mileage.toLocaleString()} km</span>
                  <span>⚙️ {comp.transmission}</span>
                </div>
                <strong className="comp-price">
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

      <hr className="divider" />

      <div className="shap-section">
        <h3>Explainable AI (XAI) Logic Breakdown</h3>
        <p className="shap-description">
          How did the algorithm arrive at this price? The chart below shows how
          each specific feature of your vehicle pushed the price up (red) or
          down (blue) from the national market average.
        </p>
        <div className="shap-image-container">
          <img
            src={`data:image/png;base64,${result.shap_image_base64}`}
            alt="SHAP Waterfall Explanation"
            className="shap-image"
          />
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
