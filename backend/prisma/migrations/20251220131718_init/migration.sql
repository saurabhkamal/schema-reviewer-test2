-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DEVELOPER', 'VIEWER');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');

-- CreateEnum
CREATE TYPE "IssueCategory" AS ENUM ('INDEX', 'NORMALIZATION', 'QUERY_PERFORMANCE', 'FOREIGN_KEYS', 'DATA_TYPES', 'CONSTRAINTS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "databases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "databases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_snapshots" (
    "id" TEXT NOT NULL,
    "databaseId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "snapshotId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schema_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schemaName" TEXT NOT NULL,
    "rowCount" INTEGER,
    "sizeBytes" BIGINT,
    "sizeFormatted" TEXT,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "columns" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nullable" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" TEXT,
    "isPrimaryKey" BOOLEAN NOT NULL DEFAULT false,
    "isForeignKey" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indexes" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "columns" TEXT[],
    "unique" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT,

    CONSTRAINT "indexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foreign_keys" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "columnName" TEXT NOT NULL,
    "referencedTable" TEXT NOT NULL,
    "referencedColumn" TEXT NOT NULL,

    CONSTRAINT "foreign_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT,
    "tableId" TEXT,
    "severity" "IssueSeverity" NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "category" "IssueCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sql_recommendations" (
    "id" TEXT NOT NULL,
    "issueId" TEXT,
    "snapshotId" TEXT,
    "sql" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "explanation" TEXT,
    "safeToRun" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sql_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "databases_name_key" ON "databases"("name");

-- CreateIndex
CREATE UNIQUE INDEX "schema_snapshots_snapshotId_key" ON "schema_snapshots"("snapshotId");

-- CreateIndex
CREATE INDEX "schema_snapshots_databaseId_createdAt_idx" ON "schema_snapshots"("databaseId", "createdAt");

-- CreateIndex
CREATE INDEX "schema_snapshots_snapshotId_idx" ON "schema_snapshots"("snapshotId");

-- CreateIndex
CREATE INDEX "tables_snapshotId_idx" ON "tables"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "tables_snapshotId_schemaName_name_key" ON "tables"("snapshotId", "schemaName", "name");

-- CreateIndex
CREATE INDEX "columns_tableId_idx" ON "columns"("tableId");

-- CreateIndex
CREATE UNIQUE INDEX "columns_tableId_name_key" ON "columns"("tableId", "name");

-- CreateIndex
CREATE INDEX "indexes_tableId_idx" ON "indexes"("tableId");

-- CreateIndex
CREATE UNIQUE INDEX "indexes_tableId_name_key" ON "indexes"("tableId", "name");

-- CreateIndex
CREATE INDEX "foreign_keys_tableId_idx" ON "foreign_keys"("tableId");

-- CreateIndex
CREATE UNIQUE INDEX "foreign_keys_tableId_name_key" ON "foreign_keys"("tableId", "name");

-- CreateIndex
CREATE INDEX "issues_snapshotId_idx" ON "issues"("snapshotId");

-- CreateIndex
CREATE INDEX "issues_tableId_idx" ON "issues"("tableId");

-- CreateIndex
CREATE INDEX "issues_severity_status_idx" ON "issues"("severity", "status");

-- CreateIndex
CREATE INDEX "sql_recommendations_issueId_idx" ON "sql_recommendations"("issueId");

-- CreateIndex
CREATE INDEX "sql_recommendations_snapshotId_idx" ON "sql_recommendations"("snapshotId");

-- AddForeignKey
ALTER TABLE "schema_snapshots" ADD CONSTRAINT "schema_snapshots_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "databases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "schema_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "columns" ADD CONSTRAINT "columns_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indexes" ADD CONSTRAINT "indexes_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foreign_keys" ADD CONSTRAINT "foreign_keys_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "schema_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sql_recommendations" ADD CONSTRAINT "sql_recommendations_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sql_recommendations" ADD CONSTRAINT "sql_recommendations_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "schema_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
