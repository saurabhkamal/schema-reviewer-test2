# ML Model for Index Performance Prediction

This directory contains scripts and models for predicting performance improvement from adding database indexes.

## Overview

The ML model predicts: **"If we add an index to this table, by what percentage will query performance improve?"**

### Model Inputs (Features):
1. **Table Size** - Number of rows in the table
2. **Join Depth** - How many tables are joined in queries using this table
3. **Cost Difference** - EXPLAIN plan cost reduction from adding the index

### Model Output:
- **Expected % Improvement** - Predicted performance improvement percentage

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install pandas numpy scikit-learn xgboost lightgbm
```

### 2. Generate Synthetic Training Data

```bash
npm run ml:generate-data
```

This creates `data/training_data.csv` with synthetic EXPLAIN data.

### 3. Train Models

```bash
npm run ml:train
```

This trains both XGBoost and LightGBM models and saves them to `models/`.

## Usage

### Generate Data
```bash
python scripts/ml/generate_synthetic_data.py
```

### Train Models
```bash
python scripts/ml/train_model.py
```

## Model Files

Trained models are saved in `models/`:
- `xgboost_index_predictor.pkl` - XGBoost model
- `lightgbm_index_predictor.pkl` - LightGBM model
- `*_metrics.txt` - Model evaluation metrics

## Integration

The trained models will be integrated into the backend service to:
1. Calculate features when a missing index is detected
2. Predict performance improvement percentage
3. Display in UI to help prioritize which indexes to add first

## Next Steps

1. ✅ Generate synthetic dataset
2. ✅ Train baseline models
3. ⏳ Integrate model into backend service
4. ⏳ Add prediction to Issue model
5. ⏳ Display predictions in UI
