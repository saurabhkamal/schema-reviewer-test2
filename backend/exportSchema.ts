import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportSchema() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT json_agg(
      json_build_object(
        'databaseName', current_database(),
        'databaseType', 'postgresql',
        'tables', (
          SELECT json_agg(
            json_build_object(
              'name', t.table_name,
              'schemaName', t.table_schema,
              'rowCount', (
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = t.table_schema 
                AND table_name = t.table_name
              ),
              'columns', (
                SELECT json_agg(
                  json_build_object(
                    'name', c.column_name,
                    'type', c.data_type || COALESCE('(' || c.character_maximum_length || ')',''),
                    'nullable', c.is_nullable = 'YES',
                    'defaultValue', c.column_default,
                    'isPrimaryKey', EXISTS(
                      SELECT 1 FROM information_schema.table_constraints tc
                      JOIN information_schema.key_column_usage kcu 
                      ON tc.constraint_name = kcu.constraint_name
                      WHERE tc.table_name = t.table_name
                      AND tc.constraint_type = 'PRIMARY KEY'
                      AND kcu.column_name = c.column_name
                    ),
                    'isForeignKey', EXISTS(
                      SELECT 1 FROM information_schema.table_constraints tc
                      WHERE tc.table_name = t.table_name
                      AND tc.constraint_type = 'FOREIGN KEY'
                    )
                  )
                )
                FROM information_schema.columns c
                WHERE c.table_schema = t.table_schema
                AND c.table_name = t.table_name
              )
            )
          )
          FROM information_schema.tables t
          WHERE t.table_schema NOT IN ('pg_catalog','information_schema')
          AND t.table_type='BASE TABLE'
        )
      )
    ) AS full_schema;
  `);

  fs.writeFileSync('volunteer_schema.json', JSON.stringify(tables, null, 2));
  console.log('Schema exported to volunteer_schema.json');
}

exportSchema()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
