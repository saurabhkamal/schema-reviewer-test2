import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

interface PredictionFeatures {
  tableSize: number;
  joinDepth: number;
  costDifference: number;
}

interface PredictionResult {
  predictedImprovement: number;
  modelUsed: string;
  confidence?: number;
}

/**
 * Predict performance improvement percentage from adding an index
 * 
 * @param features - Input features: table size, join depth, cost difference
 * @returns Predicted improvement percentage (0-100)
 */
export async function predictIndexImprovement(
  features: PredictionFeatures
): Promise<PredictionResult> {
  try {
    // Validate features
    if (features.tableSize <= 0 || features.joinDepth < 1 || features.costDifference < 0) {
      logger.warn('Invalid features for ML prediction', { features });
      return {
        predictedImprovement: 0,
        modelUsed: 'fallback',
      };
    }

    // Call Python prediction script
    const scriptPath = path.join(__dirname, '../../scripts/ml/predict.py');
    const command = `python "${scriptPath}" ${features.tableSize} ${features.joinDepth} ${features.costDifference}`;

    logger.info('Calling ML prediction model', { features });

    const { stdout, stderr } = await execAsync(command, {
      timeout: 10000, // 10 second timeout
      maxBuffer: 1024 * 1024, // 1MB buffer
    });

    if (stderr && !stderr.includes('WARNING')) {
      logger.warn('ML prediction script stderr', { stderr });
    }

    // Parse output (expected format: "prediction:XX.XX,model:name")
    const output = stdout.trim();
    const match = output.match(/prediction:([\d.]+),model:(\w+)/);

    if (match) {
      const predictedImprovement = parseFloat(match[1]);
      const modelUsed = match[2];

      logger.info('ML prediction completed', {
        predictedImprovement,
        modelUsed,
        features,
      });

      return {
        predictedImprovement: Math.max(0, Math.min(100, predictedImprovement)), // Clamp 0-100
        modelUsed,
      };
    } else {
      logger.error('Failed to parse ML prediction output', { output });
      throw new Error('Invalid prediction output format');
    }
  } catch (error) {
    logger.error('ML prediction failed', {
      error: error instanceof Error ? error.message : String(error),
      features,
    });

    // Fallback: Simple heuristic-based prediction
    return fallbackPrediction(features);
  }
}

/**
 * Fallback prediction using simple heuristics when ML model is unavailable
 */
function fallbackPrediction(features: PredictionFeatures): PredictionResult {
  // Simple heuristic: larger tables and more joins = more improvement potential
  const sizeFactor = Math.min(1, Math.log10(features.tableSize) / 7); // 0-1 based on log scale
  const joinFactor = Math.min(1, (features.joinDepth - 1) / 4); // 0-1 based on joins
  const costFactor = Math.min(1, features.costDifference / 10000); // 0-1 based on cost diff

  const predictedImprovement = (sizeFactor * 0.4 + joinFactor * 0.3 + costFactor * 0.3) * 80; // Max 80%

  return {
    predictedImprovement: Math.round(predictedImprovement * 10) / 10, // Round to 1 decimal
    modelUsed: 'heuristic-fallback',
  };
}

/**
 * Calculate features from database schema and query context
 * 
 * @param tableRowCount - Number of rows in the table
 * @param queryContext - Query execution context (optional, for join depth)
 * @param costBefore - EXPLAIN cost before index (optional)
 * @param costAfter - EXPLAIN cost after index (optional)
 */
export function calculateFeatures(
  tableRowCount: number,
  queryContext?: {
    joinDepth?: number;
    costBefore?: number;
    costAfter?: number;
  }
): PredictionFeatures {
  // Default join depth if not provided (most queries have 1-2 joins)
  const joinDepth = queryContext?.joinDepth || 2;

  // Calculate cost difference if both costs provided
  let costDifference = 0;
  if (queryContext?.costBefore && queryContext?.costAfter) {
    costDifference = queryContext.costBefore - queryContext.costAfter;
  } else if (queryContext?.costBefore) {
    // Estimate cost after based on typical index improvement
    // Indexes typically reduce cost by 50-90% depending on table size
    const estimatedReduction = Math.min(0.9, 0.3 + Math.log10(tableRowCount) / 10);
    costDifference = queryContext.costBefore * estimatedReduction;
  } else {
    // Estimate cost difference based on table size and joins
    // Larger tables and more joins = higher potential cost reduction
    const baseCost = tableRowCount * (0.1 + (joinDepth - 1) * 0.2);
    const estimatedReduction = Math.min(0.9, 0.4 + Math.log10(tableRowCount) / 15);
    costDifference = baseCost * estimatedReduction;
  }

  return {
    tableSize: tableRowCount,
    joinDepth,
    costDifference: Math.max(0, costDifference),
  };
}
