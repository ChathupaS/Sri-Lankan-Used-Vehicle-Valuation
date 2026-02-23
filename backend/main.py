from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
import shap
import matplotlib.pyplot as plt
import io
import base64

app = FastAPI(title="Ikman Car Price Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open('used_car_xgboost_model.pkl', 'rb') as f:
    data = pickle.load(f)
model = data['model']
model_features = data['features']

df = pd.read_csv("../data/clean_used_cars.csv")

brand_model_map = df.groupby('Brand')['Model'].unique().apply(lambda x: sorted(list(x))).to_dict()
available_brands = sorted(list(brand_model_map.keys()))
available_transmissions = sorted(df['Transmission'].unique().tolist())
available_fuel_types = sorted(df['Fuel type'].unique().tolist())

class CarInput(BaseModel):
    brand: str
    car_model: str
    year: int
    mileage: float
    engine_cc: float
    transmission: str
    fuel_type: str

@app.get("/options")
def get_form_options():
    return {
        "brands": available_brands,
        "brand_model_map": brand_model_map,
        "transmissions": available_transmissions,
        "fuel_types": available_fuel_types
    }

@app.post("/predict")
def predict_price(car: CarInput):
    input_df = pd.DataFrame(0, index=[0], columns=model_features)
    
    if 'Year of Manufacture' in input_df.columns:
        input_df['Year of Manufacture'] = car.year
    if 'Mileage' in input_df.columns:
        input_df['Mileage'] = car.mileage
    if 'Engine capacity' in input_df.columns:
        input_df['Engine capacity'] = car.engine_cc
        
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
        
    prediction = model.predict(input_df)[0].item()
    
    margin = prediction * 0.08
    lower_bound = prediction - margin
    upper_bound = prediction + margin
    
    input_df_future = input_df.copy()
    if 'Year of Manufacture' in input_df_future.columns:
        input_df_future['Year of Manufacture'] = car.year - 1
    if 'Mileage' in input_df_future.columns:
        input_df_future['Mileage'] = car.mileage + 15000
        
    future_prediction = model.predict(input_df_future)[0].item()
    
    comps_df = df[(df['Brand'] == car.brand) & (df['Model'] == car.car_model)].copy()
    comps = []
    
    if not comps_df.empty:
        comps_df['similarity'] = abs(comps_df['Year of Manufacture'] - car.year) * 15000 + abs(comps_df['Mileage'] - car.mileage)
        top_comps = comps_df.sort_values('similarity').head(3)
        
        for _, row in top_comps.iterrows():
            comps.append({
                "year": int(row['Year of Manufacture']),
                "mileage": float(row['Mileage']),
                "price": float(row['Selling Price']),
                "transmission": str(row['Transmission'])
            })
    
    input_df_shap = input_df.astype(float)
    explainer = shap.TreeExplainer(model)
    shap_values = explainer(input_df_shap)
    
    fig, ax = plt.subplots(figsize=(10, 5))
    shap.plots.waterfall(shap_values[0], max_display=10, show=False)
    
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight', dpi=150)
    plt.close(fig)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    
    return {
        "predicted_price": prediction,
        "lower_bound": lower_bound,
        "upper_bound": upper_bound,
        "future_price": future_prediction,
        "comps": comps,
        "shap_image_base64": img_base64
    }