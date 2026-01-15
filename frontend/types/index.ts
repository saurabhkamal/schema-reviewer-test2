// Database and Schema Types
export interface Database {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastPing?: number;
  tablesCount?: number;
}

export interface Schema {
  id: string;
  name: string;
  databaseId: string;
  tables: Table[];
}

export interface Table {
  id: string;
  name: string;
  schemaId: string;
  rowCount?: number;
  size?: string;
  columns: Column[];
  indexes: Index[];
  foreignKeys: ForeignKey[];
  issues: Issue[];
}

export interface Column {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  indexed: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface Index {
  id: string;
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
}

export interface ForeignKey {
  id: string;
  name: string;
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
}

// Issue Types
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'resolved' | 'ignored';
export type IssueCategory = 
  | 'index'
  | 'normalization'
  | 'query-performance'
  | 'foreign-keys'
  | 'data-types'
  | 'constraints';

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  category: IssueCategory;
  tableId?: string;
  tableName?: string;
  columnId?: string;
  columnName?: string;
  createdAt: string;
  resolvedAt?: string;
  recommendation?: string;
  sqlFix?: string;
}

// Scan Types
export interface Scan {
  id: string;
  databaseId: string;
  databaseName: string;
  tablesScanned: number;
  issuesFound: number;
  healthScore: number;
  duration: string;
  createdAt: string;
  status: 'completed' | 'running' | 'failed';
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

// Dashboard Types
export interface DashboardStats {
  healthScore: number;
  healthScoreChange: number;
  criticalIssues: number;
  criticalIssuesChange: number;
  tablesScanned: number;
  columnsAnalyzed: number;
  optimizationPotential: number;
}

export interface IssuesOverview {
  critical: number;
  high: number;
  medium: number;
  low: number;
  criticalChange: number;
  highChange: number;
  mediumChange: number;
  lowChange: number;
}

// AI Assistant Types
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  preview: string | null;
  databaseName: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sqlCode?: string;
  sqlSuggestions?: string[];
  recommendations?: string[];
}

// SQL Generator Types
export interface SQLGenerationRequest {
  prompt: string;
  context?: {
    tableId?: string;
    schemaId?: string;
  };
}

export interface SQLGeneration {
  id: string;
  sql: string;
  description: string;
  createdAt: string;
}

// Analytics Types
export interface AnalyticsData {
  period: string;
  healthScore: number;
  issuesCount: number;
  scansCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

