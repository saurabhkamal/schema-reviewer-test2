"""
Train XGBoost and LightGBM models to predict index performance improvement

This script:
1. Loads the synthetic training data
2. Trains both XGBoost and LightGBM models
3. Evaluates model performance
4. Saves the best model for production use
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import pickle
import os
import sys

# Try to import ML libraries
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("WARNING: XGBoost not installed. Install with: pip install xgboost")

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False
    print("WARNING: LightGBM not installed. Install with: pip install lightgbm")

# Configuration
DATA_FILE = 'data/training_data.csv'
MODELS_DIR = 'models'
TEST_SIZE = 0.2
RANDOM_STATE = 42

def load_data():
    """Load training data from CSV"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, '..', '..', DATA_FILE)
    
    if not os.path.exists(data_path):
        print(f"ERROR: Data file not found at {data_path}")
        print(f"   Run 'npm run ml:generate-data' first to generate training data")
        sys.exit(1)
    
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} samples from {data_path}")
    return df

def prepare_features(df):
    """Prepare features and target variable"""
    # Features: table_size, join_depth, cost_difference
    X = df[['table_size', 'join_depth', 'cost_difference']].values
    # Target: actual_improvement_percent
    y = df['actual_improvement_percent'].values
    
    print(f"\nFeatures shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    print(f"Feature ranges:")
    print(f"   Table size: {X[:, 0].min():,.0f} - {X[:, 0].max():,.0f} rows")
    print(f"   Join depth: {X[:, 1].min()} - {X[:, 1].max()} tables")
    print(f"   Cost difference: {X[:, 2].min():,.0f} - {X[:, 2].max():,.0f}")
    print(f"Target range: {y.min():.1f}% - {y.max():.1f}% improvement")
    
    return X, y

def train_xgboost(X_train, y_train, X_test, y_test):
    """Train XGBoost model"""
    if not XGBOOST_AVAILABLE:
        return None
    
    print("\nTraining XGBoost model...")
    
    # XGBoost parameters
    params = {
        'objective': 'reg:squarederror',
        'max_depth': 6,
        'learning_rate': 0.1,
        'n_estimators': 300,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'random_state': RANDOM_STATE,
        'eval_metric': 'rmse'
    }
    
    model = xgb.XGBRegressor(**params)
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )
    
    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"   MAE:  {mae:.2f}%")
    print(f"   RMSE: {rmse:.2f}%")
    print(f"   R²:   {r2:.4f}")
    
    return model, {'mae': mae, 'rmse': rmse, 'r2': r2}

def train_lightgbm(X_train, y_train, X_test, y_test):
    """Train LightGBM model"""
    if not LIGHTGBM_AVAILABLE:
        return None
    
    print("\nTraining LightGBM model...")
    
    # LightGBM parameters
    params = {
        'objective': 'regression',
        'metric': 'rmse',
        'num_leaves': 31,
        'learning_rate': 0.1,
        'feature_fraction': 0.8,
        'bagging_fraction': 0.8,
        'bagging_freq': 5,
        'verbose': -1,
        'random_state': RANDOM_STATE
    }
    
    train_data = lgb.Dataset(X_train, label=y_train)
    test_data = lgb.Dataset(X_test, label=y_test, reference=train_data)
    
    model = lgb.train(
        params,
        train_data,
        num_boost_round=300,
        valid_sets=[test_data],
        callbacks=[lgb.early_stopping(stopping_rounds=50), lgb.log_evaluation(0)]
    )
    
    # Evaluate
    y_pred = model.predict(X_test, num_iteration=model.best_iteration)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"   MAE:  {mae:.2f}%")
    print(f"   RMSE: {rmse:.2f}%")
    print(f"   R²:   {r2:.4f}")
    
    return model, {'mae': mae, 'rmse': rmse, 'r2': r2}

def save_model(model, model_name, metrics):
    """Save trained model to disk"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_path = os.path.join(script_dir, '..', '..', MODELS_DIR)
    os.makedirs(models_path, exist_ok=True)
    
    model_file = os.path.join(models_path, f'{model_name}.pkl')
    
    # Save model
    with open(model_file, 'wb') as f:
        pickle.dump(model, f)
    
    # Save metrics
    metrics_file = os.path.join(models_path, f'{model_name}_metrics.txt')
    with open(metrics_file, 'w') as f:
        f.write(f"Model: {model_name}\n")
        f.write(f"MAE:  {metrics['mae']:.2f}%\n")
        f.write(f"RMSE: {metrics['rmse']:.2f}%\n")
        f.write(f"R²:   {metrics['r2']:.4f}\n")
    
    print(f"   Saved model to: {model_file}")
    print(f"   Saved metrics to: {metrics_file}")
    
    return model_file

def main():
    import sys
    import io
    # Fix Windows console encoding for emojis
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    
    print("Training ML models for index performance prediction\n")
    
    # Load data
    df = load_data()
    
    # Prepare features
    X, y = prepare_features(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    print(f"\nTrain set: {len(X_train)} samples ({100*(1-TEST_SIZE):.0f}%)")
    print(f"Test set:  {len(X_test)} samples ({100*TEST_SIZE:.0f}%)")
    
    models_trained = []
    
    # Train XGBoost
    if XGBOOST_AVAILABLE:
        xgb_model, xgb_metrics = train_xgboost(X_train, y_train, X_test, y_test)
        if xgb_model:
            save_model(xgb_model, 'xgboost_index_predictor', xgb_metrics)
            models_trained.append(('XGBoost', xgb_metrics))
    
    # Train LightGBM
    if LIGHTGBM_AVAILABLE:
        lgb_model, lgb_metrics = train_lightgbm(X_train, y_train, X_test, y_test)
        if lgb_model:
            save_model(lgb_model, 'lightgbm_index_predictor', lgb_metrics)
            models_trained.append(('LightGBM', lgb_metrics))
    
    # Summary
    if models_trained:
        print("\n" + "="*50)
        print("Model Comparison:")
        print("="*50)
        for name, metrics in models_trained:
            print(f"\n{name}:")
            print(f"  MAE:  {metrics['mae']:.2f}%")
            print(f"  RMSE: {metrics['rmse']:.2f}%")
            print(f"  R²:   {metrics['r2']:.4f}")
        
        # Recommend best model (highest R²)
        best_model = max(models_trained, key=lambda x: x[1]['r2'])
        print(f"\nBest Model: {best_model[0]} (R² = {best_model[1]['r2']:.4f})")
        print(f"\nModels saved! Ready for integration.")
    else:
        print("\nERROR: No models trained. Please install XGBoost or LightGBM:")
        print("   pip install xgboost lightgbm scikit-learn pandas numpy")

if __name__ == '__main__':
    main()
