"""
Predict performance improvement using trained ML model

This script loads a trained model and makes predictions for new data points.
Called from Node.js backend service.

Usage: python predict.py <table_size> <join_depth> <cost_difference>
Output: prediction:XX.XX,model:name
"""

import sys
import pickle
import os
import numpy as np

# Configuration
MODELS_DIR = 'models'
DEFAULT_MODEL = 'lightgbm_index_predictor'  # Prefer LightGBM (usually faster)

def load_model(model_name):
    """Load trained model from pickle file"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, '..', '..', MODELS_DIR, f'{model_name}.pkl')
    
    if not os.path.exists(model_path):
        return None
    
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        return model
    except Exception as e:
        print(f"Error loading model {model_name}: {e}", file=sys.stderr)
        return None

def predict(model, table_size, join_depth, cost_difference):
    """Make prediction using loaded model"""
    # Prepare features as numpy array
    features = np.array([[table_size, join_depth, cost_difference]])
    
    # Make prediction
    prediction = model.predict(features)[0]
    
    # Clamp to 0-100%
    prediction = max(0, min(100, prediction))
    
    return prediction

def main():
    if len(sys.argv) != 4:
        print("Usage: python predict.py <table_size> <join_depth> <cost_difference>", file=sys.stderr)
        sys.exit(1)
    
    try:
        table_size = float(sys.argv[1])
        join_depth = float(sys.argv[2])
        cost_difference = float(sys.argv[3])
    except ValueError:
        print("Error: All arguments must be numbers", file=sys.stderr)
        sys.exit(1)
    
    # Try to load models in order of preference
    models_to_try = [DEFAULT_MODEL, 'xgboost_index_predictor']
    model_loaded = None
    model_name = None
    
    for model_name in models_to_try:
        model_loaded = load_model(model_name)
        if model_loaded:
            break
    
    if not model_loaded:
        # No model available - return fallback
        print("prediction:0.0,model:none", file=sys.stderr)
        sys.exit(1)
    
    # Make prediction
    try:
        prediction = predict(model_loaded, table_size, join_depth, cost_difference)
        print(f"prediction:{prediction:.2f},model:{model_name}")
    except Exception as e:
        print(f"Error making prediction: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
