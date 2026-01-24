/**
 * Test script to verify ML model is working correctly
 * Tests the complete flow: feature calculation → ML prediction → result
 */

require('dotenv').config();
const { predictIndexImprovement, calculateFeatures } = require('../src/services/ml-prediction.service');

async function testMLModel() {
  console.log('🧪 Testing ML Model for Index Performance Prediction\n');
  console.log('='.repeat(80));

  // Test cases with different scenarios
  const testCases = [
    {
      name: 'Large table with foreign keys',
      tableRowCount: 150000,
      joinDepth: 2,
      description: 'Simulates a large orders table with foreign key joins'
    },
    {
      name: 'Medium table with single join',
      tableRowCount: 50000,
      joinDepth: 1,
      description: 'Simulates a medium-sized table with simple queries'
    },
    {
      name: 'Small table with multiple joins',
      tableRowCount: 10000,
      joinDepth: 3,
      description: 'Simulates a smaller table but with complex joins'
    },
    {
      name: 'Very large table',
      tableRowCount: 1000000,
      joinDepth: 2,
      description: 'Simulates a very large table (1M rows)'
    }
  ];

  console.log(`\n📊 Running ${testCases.length} test cases...\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Test Case ${i + 1}: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);
    console.log(`Input:`);
    console.log(`  - Table Size: ${testCase.tableRowCount.toLocaleString()} rows`);
    console.log(`  - Join Depth: ${testCase.joinDepth} tables`);

    try {
      // Calculate features
      const features = calculateFeatures(testCase.tableRowCount, {
        joinDepth: testCase.joinDepth
      });

      console.log(`\nCalculated Features:`);
      console.log(`  - Table Size: ${features.tableSize.toLocaleString()}`);
      console.log(`  - Join Depth: ${features.joinDepth}`);
      console.log(`  - Cost Difference: ${features.costDifference.toFixed(2)}`);

      // Get ML prediction
      console.log(`\n🤖 Calling ML Model...`);
      const startTime = Date.now();
      const prediction = await predictIndexImprovement(features);
      const duration = Date.now() - startTime;

      console.log(`\n✅ Prediction Result:`);
      console.log(`  - Predicted Improvement: ${prediction.predictedImprovement.toFixed(2)}%`);
      console.log(`  - Model Used: ${prediction.modelUsed}`);
      console.log(`  - Response Time: ${duration}ms`);

      // Validate prediction
      if (prediction.predictedImprovement >= 0 && prediction.predictedImprovement <= 100) {
        console.log(`  - ✅ Prediction is valid (0-100%)`);
      } else {
        console.log(`  - ❌ Prediction is out of range!`);
      }

      if (prediction.modelUsed.includes('lightgbm') || prediction.modelUsed.includes('xgboost')) {
        console.log(`  - ✅ Using ML model (not fallback)`);
      } else {
        console.log(`  - ⚠️  Using fallback heuristic (ML model may not be available)`);
      }

    } catch (error) {
      console.error(`\n❌ Test failed:`, error.message);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('\n✅ ML Model Testing Complete!\n');
  console.log('Next Steps:');
  console.log('1. Check backend logs for detailed ML prediction logs');
  console.log('2. Verify predictions in UI at http://localhost:3000/issues');
  console.log('3. Run: node scripts/query_ml_predictions.js to see database predictions\n');
}

// Run tests
testMLModel()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
  });
