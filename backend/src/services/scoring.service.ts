import prisma from '../config/database';
import { logger } from '../utils/logger';
import type { IssueSeverity, IssueCategory } from '@prisma/client';
import { predictIndexImprovement, calculateFeatures } from './ml-prediction.service';

interface ScoringRule {
  name: string;
  severity: IssueSeverity;
  category: IssueCategory;
  check: (table: any) => boolean;
  description: (table: any) => string;
  recommendation: (table: any) => string;
}

const scoringRules: ScoringRule[] = [
  {
    name: 'Missing index on foreign key',
    severity: 'HIGH',
    category: 'FOREIGN_KEYS',
    check: (table) => {
      const hasForeignKeys = table.foreignKeys && table.foreignKeys.length > 0;
      if (!hasForeignKeys) return false;

      return table.foreignKeys.some((fk: any) => {
        const columnHasIndex = table.indexes?.some((idx: any) =>
          idx.columns.includes(fk.columnName)
        );
        return !columnHasIndex;
      });
    },
    description: (table) => {
      const fkWithoutIndex = table.foreignKeys.find((fk: any) => {
        const columnHasIndex = table.indexes?.some((idx: any) =>
          idx.columns.includes(fk.columnName)
        );
        return !columnHasIndex;
      });
      return `${table.name}.${fkWithoutIndex?.columnName} is a foreign key but lacks an index`;
    },
    recommendation: (table) => {
      const fkWithoutIndex = table.foreignKeys.find((fk: any) => {
        const columnHasIndex = table.indexes?.some((idx: any) =>
          idx.columns.includes(fk.columnName)
        );
        return !columnHasIndex;
      });
      return `Create an index on ${table.name}.${fkWithoutIndex?.columnName} to improve join performance`;
    },
  },
  {
    name: 'Large table without indexes',
    severity: 'MEDIUM',
    category: 'INDEX',
    check: (table) => {
      const rowCount = table.rowCount || 0;
      const hasIndexes = table.indexes && table.indexes.length > 0;
      return rowCount > 10000 && !hasIndexes;
    },
    description: (table) => {
      return `${table.name} has ${table.rowCount?.toLocaleString()} rows but no indexes`;
    },
    recommendation: (table) => {
      return `Add indexes on frequently queried columns in ${table.name}`;
    },
  },
  {
    name: 'Too many columns',
    severity: 'LOW',
    category: 'NORMALIZATION',
    check: (table) => {
      const columnCount = table.columns?.length || 0;
      return columnCount > 30;
    },
    description: (table) => {
      return `${table.name} has ${table.columns?.length} columns, consider normalization`;
    },
    recommendation: (table) => {
      return `Consider splitting ${table.name} into smaller, normalized tables`;
    },
  },
  {
    name: 'Missing primary key',
    severity: 'CRITICAL',
    category: 'CONSTRAINTS',
    check: (table) => {
      const hasPrimaryKey = table.columns?.some((col: any) => col.isPrimaryKey);
      return !hasPrimaryKey;
    },
    description: (table) => {
      return `${table.name} is missing a primary key constraint`;
    },
    recommendation: (table) => {
      return `Add a primary key to ${table.name} for data integrity`;
    },
  },
  {
    name: 'Nullable columns in critical fields',
    severity: 'MEDIUM',
    category: 'DATA_TYPES',
    check: (table) => {
      const criticalColumns = ['email', 'username', 'user_id', 'id'];
      return table.columns?.some((col: any) => {
        return criticalColumns.some((critical) =>
          col.name.toLowerCase().includes(critical.toLowerCase())
        ) && col.nullable;
      });
    },
    description: (table) => {
      const nullableCritical = table.columns?.find((col: any) => {
        const criticalColumns = ['email', 'username', 'user_id'];
        return criticalColumns.some((critical) =>
          col.name.toLowerCase().includes(critical.toLowerCase())
        ) && col.nullable;
      });
      return `${table.name}.${nullableCritical?.name} should not be nullable`;
    },
    recommendation: (table) => {
      const nullableCritical = table.columns?.find((col: any) => {
        const criticalColumns = ['email', 'username', 'user_id'];
        return criticalColumns.some((critical) =>
          col.name.toLowerCase().includes(critical.toLowerCase())
        ) && col.nullable;
      });
      return `Make ${table.name}.${nullableCritical?.name} NOT NULL for data integrity`;
    },
  },
];

export const analyzeSchema = async (snapshotId: string) => {
  const snapshot = await prisma.schemaSnapshot.findUnique({
    where: { snapshotId },
    include: {
      tables: {
        include: {
          columns: true,
          indexes: true,
          foreignKeys: true,
        },
      },
    },
  });

  if (!snapshot) {
    throw new Error('Snapshot not found');
  }

  const issues = [];

  for (const table of snapshot.tables) {
    for (const rule of scoringRules) {
      if (rule.check(table)) {
        // For index-related issues, predict performance improvement using ML
        let predictedImprovement: number | null = null;
        
        if (rule.category === 'INDEX' || rule.category === 'FOREIGN_KEYS') {
          try {
            const tableRowCount = table.rowCount || 0;
            
            // Calculate features for ML prediction
            const features = calculateFeatures(tableRowCount, {
              // Estimate join depth: foreign keys typically involve 2 tables, large tables may have more
              joinDepth: table.foreignKeys && table.foreignKeys.length > 0 ? 2 : 1,
            });
            
            // Get ML prediction
            const prediction = await predictIndexImprovement(features);
            predictedImprovement = prediction.predictedImprovement;
            
            logger.info('ML prediction for index issue', {
              tableName: table.name,
              predictedImprovement,
              modelUsed: prediction.modelUsed,
            });
          } catch (error) {
            logger.warn('Failed to get ML prediction for index issue', {
              error: error instanceof Error ? error.message : String(error),
              tableName: table.name,
            });
            // Continue without prediction if ML fails
          }
        }
        
        const issue = await prisma.issue.create({
          data: {
            snapshot: {
              connect: { id: snapshot.id },
            },
            table: {
              connect: { id: table.id },
            },
            severity: rule.severity,
            category: rule.category,
            title: rule.name,
            description: rule.description(table),
            recommendation: rule.recommendation(table),
            predictedImprovement: predictedImprovement,
          },
        });
        issues.push(issue);
      }
    }
  }

  logger.info('Schema analysis completed', { snapshotId, issuesFound: issues.length });

  return issues;
};

export const getImpactScore = async (snapshotId: string) => {
  const snapshot = await prisma.schemaSnapshot.findUnique({
    where: { snapshotId },
  });

  if (!snapshot) {
    throw new Error('Snapshot not found');
  }

  const issues = await prisma.issue.findMany({
    where: { snapshotId: snapshot.id },
  });

  const severityWeights = {
    CRITICAL: 10,
    HIGH: 5,
    MEDIUM: 2,
    LOW: 1,
  };

  let totalScore = 0;
  const severityCounts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  for (const issue of issues) {
    totalScore += severityWeights[issue.severity];
    severityCounts[issue.severity]++;
  }

  const maxPossibleScore = 100;
  const healthScore = Math.max(0, Math.min(100, maxPossibleScore - totalScore));

  return {
    healthScore,
    totalIssues: issues.length,
    severityCounts,
    breakdown: {
      critical: severityCounts.CRITICAL,
      high: severityCounts.HIGH,
      medium: severityCounts.MEDIUM,
      low: severityCounts.LOW,
    },
  };
};

export const getRankedIssues = async (snapshotId: string, limit = 10) => {
  const snapshot = await prisma.schemaSnapshot.findUnique({
    where: { snapshotId },
  });

  if (!snapshot) {
    throw new Error('Snapshot not found');
  }

  const issues = await prisma.issue.findMany({
    where: { snapshotId: snapshot.id, status: 'OPEN' },
    include: {
      table: {
        select: {
          name: true,
          schemaName: true,
        },
      },
    },
    orderBy: [
      { severity: 'asc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });

  const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const sorted = issues.sort((a, b) => {
    const aIndex = severityOrder.indexOf(a.severity);
    const bIndex = severityOrder.indexOf(b.severity);
    return aIndex - bIndex;
  });

  return sorted;
};

