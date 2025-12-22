import prisma from '../config/database';
import { generateSnapshotId } from '../utils/uuid';
import { logger } from '../utils/logger';
import type { SchemaIngestInput } from '../utils/validation';

export const ingestSchema = async (input: SchemaIngestInput) => {
  const snapshotId = generateSnapshotId();

  const database = await prisma.database.upsert({
    where: { name: input.databaseName },
    update: {},
    create: {
      name: input.databaseName,
      type: input.databaseType,
    },
  });

  const latestSnapshot = await prisma.schemaSnapshot.findFirst({
    where: { databaseId: database.id },
    orderBy: { createdAt: 'desc' },
  });

  const version = latestSnapshot ? latestSnapshot.version + 1 : 1;

  const snapshot = await prisma.schemaSnapshot.create({
    data: {
      id: snapshotId,
      databaseId: database.id,
      version,
      snapshotId,
      tables: {
        create: input.tables.map((table) => ({
          name: table.name,
          schemaName: table.schemaName,
          rowCount: table.rowCount,
          sizeBytes: table.sizeBytes ? BigInt(table.sizeBytes) : null,
          sizeFormatted: table.sizeFormatted,
          columns: {
            create: table.columns.map((col) => ({
              name: col.name,
              type: col.type,
              nullable: col.nullable,
              defaultValue: col.defaultValue,
              isPrimaryKey: col.isPrimaryKey,
              isForeignKey: col.isForeignKey,
            })),
          },
          indexes: {
            create: table.indexes.map((idx) => ({
              name: idx.name,
              columns: idx.columns,
              unique: idx.unique,
              type: idx.type,
            })),
          },
          foreignKeys: {
            create: table.foreignKeys.map((fk) => ({
              name: fk.name,
              columnName: fk.columnName,
              referencedTable: fk.referencedTable,
              referencedColumn: fk.referencedColumn,
            })),
          },
        })),
      },
    },
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

  logger.info('Schema ingested successfully', { snapshotId, databaseId: database.id });

  return snapshot;
};

export const getLatestSnapshot = async (databaseName: string) => {
  const database = await prisma.database.findUnique({
    where: { name: databaseName },
  });

  if (!database) {
    return null;
  }

  const snapshot = await prisma.schemaSnapshot.findFirst({
    where: { databaseId: database.id },
    orderBy: { createdAt: 'desc' },
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

  return snapshot;
};

export const getSnapshotById = async (snapshotId: string) => {
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

  return snapshot;
};

export const deleteSnapshot = async (snapshotId: string) => {
  const snapshot = await prisma.schemaSnapshot.findUnique({
    where: { snapshotId },
  });

  if (!snapshot) {
    throw new Error('Snapshot not found');
  }

  await prisma.schemaSnapshot.delete({
    where: { snapshotId },
  });

  logger.info('Snapshot deleted', { snapshotId });
  return { success: true };
};

export const deleteAllSnapshots = async (databaseName?: string) => {
  if (databaseName) {
    const database = await prisma.database.findUnique({
      where: { name: databaseName },
    });

    if (!database) {
      throw new Error('Database not found');
    }

    const result = await prisma.schemaSnapshot.deleteMany({
      where: { databaseId: database.id },
    });

    logger.info('All snapshots deleted for database', { databaseName, count: result.count });
    return { success: true, deletedCount: result.count };
  } else {
    const result = await prisma.schemaSnapshot.deleteMany({});
    logger.info('All snapshots deleted', { count: result.count });
    return { success: true, deletedCount: result.count };
  }
};

export const getAllSnapshots = async (databaseName?: string, page = 1, pageSize = 20) => {
  const skip = (page - 1) * pageSize;

  const where = databaseName
    ? {
        database: {
          name: databaseName,
        },
      }
    : {};

  const [snapshots, total] = await Promise.all([
    prisma.schemaSnapshot.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        database: true,
        _count: {
          select: {
            tables: true,
            issues: true,
          },
        },
      },
    }),
    prisma.schemaSnapshot.count({ where }),
  ]);

  return {
    data: snapshots,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

