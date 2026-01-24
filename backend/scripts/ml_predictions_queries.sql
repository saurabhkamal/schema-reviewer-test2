-- ============================================================================
-- ML Predictions SQL Queries
-- Run these queries in your PostgreSQL client to view ML predictions
-- ============================================================================

-- Query 1: All Issues with ML Predictions
-- Shows all issues that have ML-predicted performance improvement values
SELECT 
  i.id,
  i.title,
  i.severity,
  i.category,
  i.description,
  i."predictedImprovement",
  i."createdAt",
  t.name as "tableName",
  ss."snapshotId"
FROM "issues" i
LEFT JOIN "tables" t ON i."tableId" = t.id
LEFT JOIN "schema_snapshots" ss ON i."snapshotId" = ss.id
WHERE i."predictedImprovement" IS NOT NULL
ORDER BY i."predictedImprovement" DESC, i.severity DESC;

-- Query 2: ML Prediction Statistics
-- Summary statistics for all ML predictions
SELECT 
  COUNT(*) as "totalIssuesWithPredictions",
  COUNT(DISTINCT i."category") as "categoriesWithPredictions",
  ROUND(AVG(i."predictedImprovement")::numeric, 2) as "avgPredictedImprovement",
  ROUND(MIN(i."predictedImprovement")::numeric, 2) as "minPredictedImprovement",
  ROUND(MAX(i."predictedImprovement")::numeric, 2) as "maxPredictedImprovement",
  COUNT(CASE WHEN i."predictedImprovement" > 50 THEN 1 END) as "highImpactIssues"
FROM "issues" i
WHERE i."predictedImprovement" IS NOT NULL;

-- Query 3: Predictions by Category
-- Average, min, and max predictions grouped by issue category
SELECT 
  i."category",
  COUNT(*) as "issueCount",
  ROUND(AVG(i."predictedImprovement")::numeric, 2) as "avgImprovement",
  ROUND(MIN(i."predictedImprovement")::numeric, 2) as "minImprovement",
  ROUND(MAX(i."predictedImprovement")::numeric, 2) as "maxImprovement"
FROM "issues" i
WHERE i."predictedImprovement" IS NOT NULL
GROUP BY i."category"
ORDER BY "avgImprovement" DESC;

-- Query 4: Predictions by Severity
-- Average predictions grouped by issue severity
SELECT 
  i."severity",
  COUNT(*) as "issueCount",
  ROUND(AVG(i."predictedImprovement")::numeric, 2) as "avgImprovement"
FROM "issues" i
WHERE i."predictedImprovement" IS NOT NULL
GROUP BY i."severity"
ORDER BY 
  CASE i."severity"
    WHEN 'CRITICAL' THEN 1
    WHEN 'HIGH' THEN 2
    WHEN 'MEDIUM' THEN 3
    WHEN 'LOW' THEN 4
  END;

-- Query 5: Top 10 Highest Impact Issues
-- Issues with the highest predicted performance improvement
SELECT 
  i.title,
  i."severity",
  i."category",
  t.name as "tableName",
  ROUND(i."predictedImprovement"::numeric, 2) as "predictedImprovement",
  i.description
FROM "issues" i
LEFT JOIN "tables" t ON i."tableId" = t.id
WHERE i."predictedImprovement" IS NOT NULL
ORDER BY i."predictedImprovement" DESC
LIMIT 10;

-- Query 6: Issues with Predictions by Table
-- Group predictions by table to see which tables have the most optimization potential
SELECT 
  t.name as "tableName",
  COUNT(*) as "issueCount",
  ROUND(AVG(i."predictedImprovement")::numeric, 2) as "avgPredictedImprovement",
  ROUND(MAX(i."predictedImprovement")::numeric, 2) as "maxPredictedImprovement",
  STRING_AGG(DISTINCT i."category", ', ') as "categories"
FROM "issues" i
LEFT JOIN "tables" t ON i."tableId" = t.id
WHERE i."predictedImprovement" IS NOT NULL
GROUP BY t.name
ORDER BY "avgPredictedImprovement" DESC;

-- Query 7: Recent ML Predictions
-- Most recently created issues with ML predictions
SELECT 
  i.title,
  i."severity",
  i."category",
  t.name as "tableName",
  ROUND(i."predictedImprovement"::numeric, 2) as "predictedImprovement",
  i."createdAt"
FROM "issues" i
LEFT JOIN "tables" t ON i."tableId" = t.id
WHERE i."predictedImprovement" IS NOT NULL
ORDER BY i."createdAt" DESC
LIMIT 20;

-- Query 8: Comparison - Issues with vs without ML Predictions
-- See how many issues have predictions vs those that don't
SELECT 
  CASE 
    WHEN i."predictedImprovement" IS NOT NULL THEN 'With ML Prediction'
    ELSE 'Without ML Prediction'
  END as "predictionStatus",
  COUNT(*) as "issueCount",
  COUNT(DISTINCT i."category") as "categories"
FROM "issues" i
GROUP BY 
  CASE 
    WHEN i."predictedImprovement" IS NOT NULL THEN 'With ML Prediction'
    ELSE 'Without ML Prediction'
  END;
