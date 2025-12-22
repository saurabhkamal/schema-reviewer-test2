import prisma from '../config/database';
import { logger } from '../utils/logger';

export const generateSqlRecommendations = async (issueId: string) => {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      table: {
        include: {
          columns: true,
          indexes: true,
          foreignKeys: true,
        },
      },
    },
  });

  if (!issue) {
    throw new Error('Issue not found');
  }

  const recommendations = [];

  if (issue.category === 'FOREIGN_KEYS' && issue.severity === 'HIGH') {
    const fk = issue.table?.foreignKeys?.find((fk) =>
      issue.description.includes(fk.columnName)
    );

    if (fk) {
      const sql = `CREATE INDEX idx_${issue.table?.name}_${fk.columnName} ON ${issue.table?.schemaName}.${issue.table?.name}(${fk.columnName});`;
      const description = `Index on foreign key column ${fk.columnName}`;
      const explanation = `This index will improve join performance when querying ${issue.table?.name} with its referenced table.`;

      const recommendation = await prisma.sqlRecommendation.create({
        data: {
          issueId: issue.id,
          snapshotId: issue.snapshotId || undefined,
          sql,
          description,
          explanation,
          safeToRun: true,
        },
      });

      recommendations.push(recommendation);
    }
  }

  if (issue.category === 'INDEX' && issue.severity === 'MEDIUM') {
    const primaryKeyColumn = issue.table?.columns?.find((col) => col.isPrimaryKey);
    if (primaryKeyColumn) {
      const sql = `CREATE INDEX idx_${issue.table?.name}_${primaryKeyColumn.name} ON ${issue.table?.schemaName}.${issue.table?.name}(${primaryKeyColumn.name});`;
      const description = `Primary index on ${primaryKeyColumn.name}`;
      const explanation = `This index will improve query performance for the primary key column.`;

      const recommendation = await prisma.sqlRecommendation.create({
        data: {
          issueId: issue.id,
          snapshotId: issue.snapshotId || undefined,
          sql,
          description,
          explanation,
          safeToRun: true,
        },
      });

      recommendations.push(recommendation);
    }
  }

  if (issue.category === 'CONSTRAINTS' && issue.severity === 'CRITICAL') {
    const primaryKeyColumn = issue.table?.columns?.find((col) => col.name.toLowerCase().includes('id'));
    if (primaryKeyColumn) {
      const sql = `ALTER TABLE ${issue.table?.schemaName}.${issue.table?.name} ADD CONSTRAINT pk_${issue.table?.name} PRIMARY KEY (${primaryKeyColumn.name});`;
      const description = `Add primary key constraint to ${issue.table?.name}`;
      const explanation = `This will ensure data integrity and improve query performance.`;

      const recommendation = await prisma.sqlRecommendation.create({
        data: {
          issueId: issue.id,
          snapshotId: issue.snapshotId || undefined,
          sql,
          description,
          explanation,
          safeToRun: false,
        },
      });

      recommendations.push(recommendation);
    }
  }

  if (issue.category === 'DATA_TYPES' && issue.severity === 'MEDIUM') {
    const nullableColumn = issue.table?.columns?.find((col) =>
      issue.description.includes(col.name) && col.nullable
    );

    if (nullableColumn) {
      const sql = `ALTER TABLE ${issue.table?.schemaName}.${issue.table?.name} ALTER COLUMN ${nullableColumn.name} SET NOT NULL;`;
      const description = `Make ${nullableColumn.name} NOT NULL`;
      const explanation = `This will enforce data integrity by preventing null values in critical columns.`;

      const recommendation = await prisma.sqlRecommendation.create({
        data: {
          issueId: issue.id,
          snapshotId: issue.snapshotId || undefined,
          sql,
          description,
          explanation,
          safeToRun: false,
        },
      });

      recommendations.push(recommendation);
    }
  }

  logger.info('SQL recommendations generated', { issueId, count: recommendations.length });

  return recommendations;
};

export const getRecommendationsForIssue = async (issueId: string) => {
  return await prisma.sqlRecommendation.findMany({
    where: { issueId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getRecommendationsForSnapshot = async (snapshotId: string) => {
  const snapshot = await prisma.schemaSnapshot.findUnique({
    where: { snapshotId },
  });

  if (!snapshot) {
    throw new Error('Snapshot not found');
  }

  return await prisma.sqlRecommendation.findMany({
    where: { snapshotId: snapshot.id },
    include: {
      issue: {
        include: {
          table: {
            select: {
              name: true,
              schemaName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

