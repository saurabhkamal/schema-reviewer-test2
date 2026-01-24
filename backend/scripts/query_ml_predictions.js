/**
 * Script to query ML predictions from the database
 * Shows all issues with their predictedImprovement values
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function queryMLPredictions() {
  try {
    console.log('🔍 Querying ML Predictions from Database...\n');
    console.log('=' .repeat(80));

    // Query 1: All issues with ML predictions
    console.log('\n📊 Query 1: All Issues with ML Predictions\n');
    const issuesWithPredictions = await prisma.$queryRaw`
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
      ORDER BY i."predictedImprovement" DESC, i.severity DESC
    `;

    console.table(issuesWithPredictions);

    // Query 2: Summary statistics
    console.log('\n📈 Query 2: ML Prediction Statistics\n');
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as "totalIssuesWithPredictions",
        COUNT(DISTINCT i."category") as "categoriesWithPredictions",
        ROUND(AVG(i."predictedImprovement")::numeric, 2) as "avgPredictedImprovement",
        ROUND(MIN(i."predictedImprovement")::numeric, 2) as "minPredictedImprovement",
        ROUND(MAX(i."predictedImprovement")::numeric, 2) as "maxPredictedImprovement",
        COUNT(CASE WHEN i."predictedImprovement" > 50 THEN 1 END) as "highImpactIssues"
      FROM "issues" i
      WHERE i."predictedImprovement" IS NOT NULL
    `;

    console.table(stats);

    // Query 3: Predictions by category
    console.log('\n📋 Query 3: Predictions by Category\n');
    const byCategory = await prisma.$queryRaw`
      SELECT 
        i.category,
        COUNT(*) as "issueCount",
        ROUND(AVG(i."predictedImprovement")::numeric, 2) as "avgImprovement",
        ROUND(MIN(i."predictedImprovement")::numeric, 2) as "minImprovement",
        ROUND(MAX(i."predictedImprovement")::numeric, 2) as "maxImprovement"
      FROM "issues" i
      WHERE i."predictedImprovement" IS NOT NULL
      GROUP BY i.category
      ORDER BY "avgImprovement" DESC
    `;

    console.table(byCategory);

    // Query 4: Predictions by severity
    console.log('\n⚡ Query 4: Predictions by Severity\n');
    const bySeverity = await prisma.$queryRaw`
      SELECT 
        i.severity,
        COUNT(*) as "issueCount",
        ROUND(AVG(i."predictedImprovement")::numeric, 2) as "avgImprovement"
      FROM "issues" i
      WHERE i."predictedImprovement" IS NOT NULL
      GROUP BY i.severity
      ORDER BY 
        CASE i.severity
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          WHEN 'LOW' THEN 4
        END
    `;

    console.table(bySeverity);

    // Query 5: Top 10 highest impact issues
    console.log('\n🏆 Query 5: Top 10 Highest Impact Issues\n');
    const topIssues = await prisma.$queryRaw`
      SELECT 
        i.title,
        i.severity,
        i.category,
        t.name as "tableName",
        ROUND(i."predictedImprovement"::numeric, 2) as "predictedImprovement",
        i.description
      FROM "issues" i
      LEFT JOIN "tables" t ON i."tableId" = t.id
      WHERE i."predictedImprovement" IS NOT NULL
      ORDER BY i."predictedImprovement" DESC
      LIMIT 10
    `;

    console.table(topIssues);

    // Query 6: Issues without predictions (for comparison)
    console.log('\n📝 Query 6: Issues Without ML Predictions\n');
    const withoutPredictions = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as "totalIssuesWithoutPredictions",
        COUNT(DISTINCT category) as "categoriesWithoutPredictions"
      FROM "issues" i
      WHERE i."predictedImprovement" IS NULL
    `;

    console.table(withoutPredictions);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Query completed successfully!\n');

  } catch (error) {
    console.error('❌ Error querying database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the query
queryMLPredictions()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
