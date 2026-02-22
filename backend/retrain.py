import pandas as pd
from xgboost import XGBRegressor
import pickle

print("1. Loading clean data...")
df = pd.read_csv("../data/clean_used_cars.csv")

print("2. Encoding features...")
df_encoded = pd.get_dummies(df, drop_first=True)
X = df_encoded.drop('Selling Price', axis=1)
y = df_encoded['Selling Price']

print("3. Training model locally to fix version mismatch...")
xgb = XGBRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=5,
    subsample=0.8,
    random_state=42,
    objective='reg:squarederror'
)
xgb.fit(X, y)

print("4. Saving the corrected model...")
model_data = {
    'model': xgb,
    'features': list(X.columns)
}

with open('used_car_xgboost_model.pkl', 'wb') as file:
    pickle.dump(model_data, file)

print("Success! Model retrained and saved. You can now restart your FastAPI server!")