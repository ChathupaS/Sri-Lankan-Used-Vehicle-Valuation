from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
import shap
import matplotlib.pyplot as plt
import io
import base64

# 1. Initialize FastAPI
app = FastAPI(title="Ikman Car Price Predictor API")

# Allow React to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load the trained XGBoost model and feature list
with open('used_car_xgboost_model.pkl', 'rb') as f:
    data = pickle.load(f)
model = data['model']
model_features = data['features']

df = pd.read_csv("../data/clean_used_cars.csv")

# Extract unique categories directly from the one-hot encoded columns
# We add common defaults in case they were the "dropped" base category during get_dummies()
brand_model_map = df.groupby('Brand')['Model'].unique().apply(lambda x: sorted(list(x))).to_dict()
available_brands = sorted(list(brand_model_map.keys()))
available_transmissions = sorted(df['Transmission'].unique().tolist())
available_fuel_types = sorted(df['Fuel type'].unique().tolist())

# 3. Define the Input Data Structure
class CarInput(BaseModel):
    brand: str
    car_model: str
    year: int
    mileage: float
    engine_cc: float
    transmission: str
    fuel_type: str

# 4. API Route: Provide dropdown options to React
@app.get("/options")
def get_form_options():
    return {
        "brands": available_brands,
        "brand_model_map": brand_model_map,  # Send the grouped dictionary to React
        "transmissions": available_transmissions,
        "fuel_types": available_fuel_types
    }

# 5. API Route: Predict Price and Generate SHAP Chart
@app.post("/predict")
def predict_price(car: CarInput):
    # Create an empty DataFrame with the exact columns the model expects
    input_df = pd.DataFrame(0, index=[0], columns=model_features)
    
    # Populate numerical features
    if 'Year of Manufacture' in input_df.columns:
        input_df['Year of Manufacture'] = car.year
    if 'Mileage' in input_df.columns:
        input_df['Mileage'] = car.mileage
    if 'Engine capacity' in input_df.columns:
        input_df['Engine capacity'] = car.engine_cc
        
    # Populate categorical features (One-Hot Encoding matching)
    brand_col = f"Brand_{car.brand}"
    if brand_col in input_df.columns:
        input_df[brand_col] = 1
        
    model_col = f"Model_{car.car_model}"
    if model_col in input_df.columns:
        input_df[model_col] = 1
        
    trans_col = f"Transmission_{car.transmission}"
    if trans_col in input_df.columns:
        input_df[trans_col] = 1
        
    fuel_col = f"Fuel type_{car.fuel_type}"
    if fuel_col in input_df.columns:
        input_df[fuel_col] = 1
        
    # Make the Prediction
    prediction = model.predict(input_df)[0]
    
    # Generate the SHAP XAI Explanation
    input_df_shap = input_df.astype(float) # Prevent numpy boolean crashes
    explainer = shap.TreeExplainer(model)
    shap_values = explainer(input_df_shap)
    
    # Plot the waterfall chart
    fig, ax = plt.subplots(figsize=(10, 5))
    shap.plots.waterfall(shap_values[0], max_display=10, show=False)
    
    # Convert the Matplotlib plot to a Base64 string so React can render it
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight', dpi=150)
    plt.close(fig)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    
    return {
        "predicted_price": float(prediction),
        "shap_image_base64": img_base64
    }