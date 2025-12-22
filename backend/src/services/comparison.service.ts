import prisma from '../config/database';
import { logger } from '../utils/logger';

export const compareSnapshots = async (snapshotId1: string, snapshotId2: string) => {
  const [snapshot1, snapshot2] = await Promise.all([
    prisma.schemaSnapshot.findUnique({
      where: { snapshotId: snapshotId1 },
      include: {
        tables: {
          include: {
            columns: true,
            indexes: true,
            foreignKeys: true,
          },
        },
      },
    }),
    prisma.schemaSnapshot.findUnique({
      where: { snapshotId: snapshotId2 },
      include: {
        tables: {
          include: {
            columns: true,
            indexes: true,
            foreignKeys: true,
          },
        },
      },
    }),
  ]);

  if (!snapshot1 || !snapshot2) {
    throw new Error('One or both snapshots not found');
  }

  const tables1 = new Map(snapshot1.tables.map((t) => [`${t.schemaName}.${t.name}`, t]));
  const tables2 = new Map(snapshot2.tables.map((t) => [`${t.schemaName}.${t.name}`, t]));

  const addedTables = [];
  const removedTables = [];
  const modifiedTables = [];

  for (const [key, table2] of tables2) {
    const table1 = tables1.get(key);
    if (!table1) {
      addedTables.push(table2);
    } else {
      const changes = compareTable(table1, table2);
      if (changes.hasChanges) {
        modifiedTables.push({
          table: table2,
          changes,
        });
      }
    }
  }

  for (const [key, table1] of tables1) {
    if (!tables2.has(key)) {
      removedTables.push(table1);
    }
  }

  logger.info('Schema comparison completed', {
    snapshotId1,
    snapshotId2,
    added: addedTables.length,
    removed: removedTables.length,
    modified: modifiedTables.length,
  });

  return {
    snapshot1: {
      id: snapshot1.snapshotId,
      version: snapshot1.version,
      createdAt: snapshot1.createdAt,
    },
    snapshot2: {
      id: snapshot2.snapshotId,
      version: snapshot2.version,
      createdAt: snapshot2.createdAt,
    },
    addedTables,
    removedTables,
    modifiedTables,
  };
};

const compareTable = (table1: any, table2: any) => {
  const changes: any = {
    hasChanges: false,
    columns: {
      added: [],
      removed: [],
      modified: [],
    },
    indexes: {
      added: [],
      removed: [],
    },
    foreignKeys: {
      added: [],
      removed: [],
    },
  };

  const cols1 = new Map(table1.columns.map((c: any) => [c.name, c]));
  const cols2 = new Map(table2.columns.map((c: any) => [c.name, c]));

  for (const [name, col2] of cols2) {
    const col1 = cols1.get(name);
    if (!col1) {
      changes.columns.added.push(col2);
      changes.hasChanges = true;
    } else {
      const col1Typed = col1 as { type: string; nullable: boolean };
      const col2Typed = col2 as { type: string; nullable: boolean };
      if (col1Typed.type !== col2Typed.type || col1Typed.nullable !== col2Typed.nullable) {
        changes.columns.modified.push({ from: col1, to: col2 });
        changes.hasChanges = true;
      }
    }
  }

  for (const [name, col1] of cols1) {
    if (!cols2.has(name)) {
      changes.columns.removed.push(col1);
      changes.hasChanges = true;
    }
  }

  const idx1 = new Set(table1.indexes.map((i: any) => i.name));
  const idx2 = new Set(table2.indexes.map((i: any) => i.name));

  for (const idxName of idx2) {
    if (!idx1.has(idxName)) {
      changes.indexes.added.push(table2.indexes.find((i: any) => i.name === idxName));
      changes.hasChanges = true;
    }
  }

  for (const idxName of idx1) {
    if (!idx2.has(idxName)) {
      changes.indexes.removed.push(table1.indexes.find((i: any) => i.name === idxName));
      changes.hasChanges = true;
    }
  }

  const fk1 = new Set(table1.foreignKeys.map((fk: any) => fk.name));
  const fk2 = new Set(table2.foreignKeys.map((fk: any) => fk.name));

  for (const fkName of fk2) {
    if (!fk1.has(fkName)) {
      changes.foreignKeys.added.push(table2.foreignKeys.find((fk: any) => fk.name === fkName));
      changes.hasChanges = true;
    }
  }

  for (const fkName of fk1) {
    if (!fk2.has(fkName)) {
      changes.foreignKeys.removed.push(table1.foreignKeys.find((fk: any) => fk.name === fkName));
      changes.hasChanges = true;
    }
  }

  return changes;
};

