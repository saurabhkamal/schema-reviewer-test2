import { z } from 'zod';

export const schemaIngestSchema = z.object({
  databaseName: z.string().min(1).max(255),
  databaseType: z.enum(['postgresql', 'mysql', 'sqlite', 'mssql']),
  tables: z.array(
    z.object({
      name: z.string().min(1).max(255),
      schemaName: z.string().min(1).max(255).default('public'),
      rowCount: z.number().int().nonnegative().optional(),
      sizeBytes: z.number().int().nonnegative().optional(),
      sizeFormatted: z.string().optional(),
      columns: z.array(
        z.object({
          name: z.string().min(1).max(255),
          type: z.string().min(1).max(255),
          nullable: z.boolean().default(false),
          defaultValue: z.string().nullable().optional(),
          isPrimaryKey: z.boolean().default(false),
          isForeignKey: z.boolean().default(false),
        })
      ).min(0),
      indexes: z.array(
        z.object({
          name: z.string().min(1).max(255),
          columns: z.array(z.string()).min(1),
          unique: z.boolean().default(false),
          type: z.string().optional(),
        })
      ).min(0),
      foreignKeys: z.array(
        z.object({
          name: z.string().min(1).max(255),
          columnName: z.string().min(1).max(255),
          referencedTable: z.string().min(1).max(255),
          referencedColumn: z.string().min(1).max(255),
        })
      ).min(0),
    })
  ).min(0),
});

export const compareSchemasSchema = z.object({
  snapshotId1: z.string().uuid(),
  snapshotId2: z.string().uuid(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'DEVELOPER', 'VIEWER']).optional(),
});

export type SchemaIngestInput = z.infer<typeof schemaIngestSchema>;
export type CompareSchemasInput = z.infer<typeof compareSchemasSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

