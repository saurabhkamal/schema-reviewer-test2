"""
Test script to verify Python ML model is working correctly
Tests the predict.py script directly
"""

import sys
import os
import subprocess

# Add parent directory to path to import predict module
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

# Test cases
test_cases = [
    {
        'name': 'Large table with foreign keys',
        'table_size': 150000,
        'join_depth': 2,
        'cost_difference': 50000,
        'description': 'Simulates a large orders table'
    },
    {
        'name': 'Medium table with single join',
        'table_size': 50000,
        'join_depth': 1,
        'cost_difference': 10000,
        'description': 'Simulates a medium-sized table'
    },
    {
        'name': 'Small table with multiple joins',
        'table_size': 10000,
        'join_depth': 3,
        'cost_difference': 5000,
        'description': 'Simulates a smaller table with complex joins'
    },
    {
        'name': 'Very large table',
        'table_size': 1000000,
        'join_depth': 2,
        'cost_difference': 100000,
        'description': 'Simulates a very large table (1M rows)'
    }
]

def test_prediction(table_size, join_depth, cost_difference):
    """Test a single prediction"""
    predict_script = os.path.join(script_dir, 'ml', 'predict.py')
    
    try:
        result = subprocess.run(
            [sys.executable, predict_script, str(table_size), str(join_depth), str(cost_difference)],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            output = result.stdout.strip()
            # Parse output: "prediction:XX.XX,model:name"
            if 'prediction:' in output and 'model:' in output:
                parts = output.split(',')
                prediction = parts[0].split(':')[1]
                model = parts[1].split(':')[1]
                return {
                    'success': True,
                    'prediction': float(prediction),
                    'model': model,
                    'output': output
                }
            else:
                return {
                    'success': False,
                    'error': f'Unexpected output format: {output}'
                }
        else:
            return {
                'success': False,
                'error': result.stderr or 'Unknown error'
            }
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Prediction timed out (>10 seconds)'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def main():
    import io
    import sys
    # Fix Windows console encoding
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    
    print('Testing ML Model for Index Performance Prediction\n')
    print('=' * 80)
    print(f'\n📊 Running {len(test_cases)} test cases...\n')
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f'\n{"─" * 80}')
        print(f'Test Case {i}: {test_case["name"]}')
        print(f'Description: {test_case["description"]}')
        print(f'Input:')
        print(f'  - Table Size: {test_case["table_size"]:,} rows')
        print(f'  - Join Depth: {test_case["join_depth"]} tables')
        print(f'  - Cost Difference: {test_case["cost_difference"]:,}')
        
        result = test_prediction(
            test_case['table_size'],
            test_case['join_depth'],
            test_case['cost_difference']
        )
        
        if result['success']:
            print(f'\n[OK] Prediction Result:')
            print(f'  - Predicted Improvement: {result["prediction"]:.2f}%')
            print(f'  - Model Used: {result["model"]}')
            
            # Validate
            if 0 <= result['prediction'] <= 100:
                print(f'  - [OK] Prediction is valid (0-100%)')
            else:
                print(f'  - [ERROR] Prediction is out of range!')
                failed += 1
                continue
            
            if 'lightgbm' in result['model'] or 'xgboost' in result['model']:
                print(f'  - [OK] Using ML model (not fallback)')
            elif 'none' in result['model']:
                print(f'  - [WARNING] ML model not found (check models/ directory)')
                failed += 1
                continue
            else:
                print(f'  - [WARNING] Using fallback heuristic')
            
            passed += 1
        else:
            print(f'\n[ERROR] Test Failed:')
            print(f'  - Error: {result["error"]}')
            failed += 1
    
    print(f'\n{"=" * 80}')
    print(f'\n📊 Test Summary:')
    print(f'  - Passed: {passed}/{len(test_cases)}')
    print(f'  - Failed: {failed}/{len(test_cases)}')
    
    if failed == 0:
        print(f'\n[SUCCESS] All tests passed! ML model is working correctly.\n')
        print('Next Steps:')
        print('1. Check UI at http://localhost:3000/issues to see predictions')
        print('2. Run: node scripts/query_ml_predictions.js to see database predictions')
        return 0
    else:
        print(f'\n[FAILED] Some tests failed. Please check:')
        print('1. Python dependencies: pip install -r scripts/ml/requirements.txt')
        print('2. Model files exist in backend/models/ directory')
        print('3. Run: npm run ml:train to generate models')
        return 1

if __name__ == '__main__':
    sys.exit(main())
