"""
Synthetic Dataset Generator for Index Performance Prediction Model

This script generates synthetic EXPLAIN data to train XGBoost/LightGBM models
that predict performance improvement from adding indexes.

Output: CSV file with features and labels for training
"""

import csv
import random
import math
import os

# Configuration
OUTPUT_FILE = 'data/training_data.csv'
NUM_SAMPLES = 1000  # Number of synthetic data points to generate

def generate_synthetic_data():
    """
    Generate synthetic training data with realistic patterns:
    - Larger tables with indexes show more improvement
    - More joins benefit more from indexes
    - Higher cost differences indicate better improvement potential
    """
    data = []
    
    for i in range(NUM_SAMPLES):
        # Feature 1: Table Size (rows)
        # Range: 1,000 to 10,000,000 rows (log scale for realism)
        table_size = int(10 ** random.uniform(3, 7))  # 1K to 10M
        
        # Feature 2: Join Depth (number of tables in query)
        # Range: 1 to 5 tables (most queries join 1-3 tables)
        join_depth = random.choices(
            [1, 2, 3, 4, 5],
            weights=[0.3, 0.4, 0.2, 0.08, 0.02]  # More common: 1-2 joins
        )[0]
        
        # Feature 3: Cost Difference (EXPLAIN cost before - after)
        # Simulate realistic cost reductions based on table size and joins
        # Larger tables and more joins = higher potential cost reduction
        base_cost = table_size * (0.1 + random.uniform(0, 0.5))
        cost_multiplier = 1 + (join_depth - 1) * 0.3  # More joins = higher cost
        
        cost_before = base_cost * cost_multiplier * random.uniform(0.8, 1.2)
        
        # Cost after index: reduction depends on table size and join complexity
        # Indexes help more on larger tables and complex joins
        reduction_factor = min(
            0.99,  # Max 99% reduction
            (math.log10(table_size) - 3) / 4 * 0.4 +  # Size factor: 0-40%
            (join_depth - 1) * 0.15 +  # Join factor: 0-60%
            random.uniform(0.1, 0.3)   # Random factor: 10-30%
        )
        
        cost_after = cost_before * (1 - reduction_factor)
        cost_difference = cost_before - cost_after
        
        # Label: Actual Improvement Percentage
        # Based on cost reduction, but with some realistic variance
        base_improvement = (cost_difference / cost_before) * 100
        
        # Add realistic variance (indexes don't always help equally)
        # Some variance based on query patterns, data distribution, etc.
        variance = random.uniform(-0.15, 0.1) * base_improvement  # -15% to +10% variance
        actual_improvement = max(0, min(99.9, base_improvement + variance))
        
        data.append({
            'table_size': table_size,
            'join_depth': join_depth,
            'cost_difference': round(cost_difference, 2),
            'actual_improvement_percent': round(actual_improvement, 2)
        })
    
    return data

def save_to_csv(data, filename):
    """Save generated data to CSV file"""
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    fieldnames = ['table_size', 'join_depth', 'cost_difference', 'actual_improvement_percent']
    
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"Generated {len(data)} synthetic data points")
    print(f"Saved to: {filename}")
    print(f"\nSample data:")
    for i, row in enumerate(data[:5]):
        print(f"  {i+1}. Table: {row['table_size']:,} rows, "
              f"Joins: {row['join_depth']}, "
              f"Cost Δ: {row['cost_difference']:,.0f}, "
              f"Improvement: {row['actual_improvement_percent']:.1f}%")

if __name__ == '__main__':
    import sys
    import io
    # Fix Windows console encoding for emojis
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    
    print("Generating synthetic EXPLAIN data for ML model training...")
    print(f"Target: {NUM_SAMPLES} samples\n")
    
    # Generate data
    data = generate_synthetic_data()
    
    # Save to CSV
    # Adjust path relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, '..', '..', OUTPUT_FILE)
    save_to_csv(data, output_path)
    
    print(f"\nDone! Ready for model training.")
    print(f"   Run: npm run ml:train")
