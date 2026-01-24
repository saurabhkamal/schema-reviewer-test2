# ML Model Setup Guide - Index Performance Prediction

## Overview

This implementation adds **XGBoost/LightGBM machine learning models** to predict performance improvement from adding database indexes. When the system detects a missing index, it now predicts: **"If we add an index to this table, by what percentage will query performance improve?"**

## What Was Built

### 1. Synthetic Data Generator (`scripts/ml/generate_synthetic_data.py`)
- Generates 1,000 synthetic training samples
- Creates realistic EXPLAIN data patterns
- Output: `data/training_data.csv`

### 2. Model Training Script (`scripts/ml/train_model.py`)
- Trains both XGBoost and LightGBM models
- Evaluates model performance (MAE, RMSE, R²)
- Saves trained models to `models/` directory

### 3. ML Prediction Service (`src/services/ml-prediction.service.ts`)
- Node.js service that calls Python models for predictions
- Calculates features from database schema
- Provides fallback heuristics if models unavailable

### 4. Database Schema Update
- Added `predictedImprovement` field to `Issue` model
- Stores ML-predicted improvement percentage (0-100)

### 5. Integration with Issue Detection
- Automatically predicts improvement for INDEX and FOREIGN_KEYS issues
- Predictions stored when issues are created

## Setup Instructions

### Step 1: Install Python Dependencies

```bash
cd backend
pip install -r scripts/ml/requirements.txt
```

Or install individually:
```bash
pip install pandas numpy scikit-learn xgboost lightgbm
```

### Step 2: Generate Training Data

```bash
npm run ml:generate-data
```

This creates `backend/data/training_data.csv` with 1,000 synthetic samples.

### Step 3: Train Models

```bash
npm run ml:train
```

This trains both models and saves them to `backend/models/`:
- `xgboost_index_predictor.pkl`
- `lightgbm_index_predictor.pkl`
- `*_metrics.txt` (evaluation metrics)

### Step 4: Run Database Migration

Update the database schema to add the `predictedImprovement` field:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This creates a new migration for the `Issue` model.

## How It Works

### Model Inputs (Features):
1. **Table Size** - Number of rows in the table
2. **Join Depth** - Number of tables joined in queries (estimated)
3. **Cost Difference** - EXPLAIN cost reduction from adding index (estimated)

### Model Output:
- **Predicted Improvement %** - Performance improvement percentage (0-100%)

### Integration Flow:
1. System detects missing index (via `scoring.service.ts`)
2. Calculates features from table metadata
3. Calls ML prediction service
4. Stores prediction in `Issue.predictedImprovement`
5. Prediction available in UI for prioritization

## Usage

### Automatic (Already Integrated)
When schema analysis runs and detects missing indexes, predictions are automatically generated and stored.

### Manual Prediction
```typescript
import { predictIndexImprovement, calculateFeatures } from './services/ml-prediction.service';

const features = calculateFeatures(
  1000000, // table row count
  { joinDepth: 2 } // optional query context
);

const prediction = await predictIndexImprovement(features);
console.log(`Predicted improvement: ${prediction.predictedImprovement}%`);
```

## Model Performance

After training, check `models/*_metrics.txt` for:
- **MAE** (Mean Absolute Error) - Average prediction error in %
- **RMSE** (Root Mean Squared Error) - Prediction error magnitude
- **R²** (Coefficient of Determination) - Model fit quality (0-1, higher is better)

## Files Created

```
backend/
├── scripts/
│   └── ml/
│       ├── generate_synthetic_data.py  # Data generator
│       ├── train_model.py              # Model training
│       ├── predict.py                  # Prediction script
│       ├── requirements.txt            # Python dependencies
│       └── README.md                  # ML documentation
├── src/
│   └── services/
│       └── ml-prediction.service.ts   # Node.js prediction service
├── data/
│   └── training_data.csv               # Generated training data
├── models/
│   ├── xgboost_index_predictor.pkl     # Trained XGBoost model
│   ├── lightgbm_index_predictor.pkl   # Trained LightGBM model
│   └── *_metrics.txt                  # Model evaluation metrics
└── ML_MODEL_SETUP.md                  # This file
```

## Next Steps

1. ✅ Generate synthetic dataset
2. ✅ Train baseline models
3. ✅ Integrate with issue detection
4. ⏳ **Update UI to display predictions** (show "Expected improvement: X%" in issue details)
5. ⏳ **Collect real EXPLAIN data** to improve model accuracy
6. ⏳ **Retrain models** periodically with new data

## Troubleshooting

### Python not found
- Ensure Python 3.8+ is installed
- Check `python --version` or `python3 --version`

### Model files not found
- Run `npm run ml:train` first to generate models
- Check `backend/models/` directory exists

### Prediction fails
- Model falls back to heuristic-based prediction
- Check backend logs for error details
- Ensure Python dependencies are installed

## Notes

- Models use **synthetic data** initially 
- Real EXPLAIN data collection can be added later for improved accuracy
- Predictions are estimates and should be validated with actual performance testing
- Models are saved as `.pkl` files (not committed to git - see `.gitignore`)
