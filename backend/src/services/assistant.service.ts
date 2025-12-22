import prisma from '../config/database';
import { logger } from '../utils/logger';
import { getRankedIssues } from './scoring.service';
import { getLatestSnapshot } from './schema.service';

export const sendMessage = async (message: string, databaseName?: string, conversationId?: string) => {
  // Simple deterministic responses based on schema analysis
  const lowerMessage = message.toLowerCase();

  // Get schema context if database is provided
  let schemaContext = null;
  if (databaseName) {
    const snapshot = await getLatestSnapshot(databaseName);
    if (snapshot) {
      const issues = await getRankedIssues(snapshot.snapshotId, 10);
      schemaContext = {
        tablesCount: snapshot.tables?.length || 0,
        issuesCount: issues?.length || 0,
        topIssues: issues?.slice(0, 3) || [],
      };
    }
  }

  let response = '';
  let recommendations: string[] = [];

  // Pattern matching for common questions
  if (lowerMessage.includes('slow') || lowerMessage.includes('performance') || lowerMessage.includes('optimize')) {
    response = 'I can help you optimize your database performance. ';
    if (schemaContext && schemaContext.topIssues.length > 0) {
      response += `I've found ${schemaContext.issuesCount} potential issues in your schema:\n\n`;
      schemaContext.topIssues.forEach((issue: any, idx: number) => {
        response += `${idx + 1}. ${issue.title}: ${issue.description}\n`;
        if (issue.tableName) {
          recommendations.push(`Review and optimize the ${issue.tableName} table`);
        }
      });
    } else {
      response += 'Common performance issues include:\n\n1. Missing indexes on frequently queried columns\n2. Foreign keys without indexes\n3. Large tables without proper partitioning\n4. Unnecessary columns in frequently accessed tables';
      recommendations = [
        'Add indexes on foreign key columns',
        'Create composite indexes for common query patterns',
        'Consider partitioning large tables',
      ];
    }
  } else if (lowerMessage.includes('index') || lowerMessage.includes('indexing')) {
    response = 'Indexes are crucial for query performance. ';
    if (schemaContext) {
      response += `Your database has ${schemaContext.tablesCount} tables. `;
    }
    response += 'Key indexing best practices:\n\n1. Index foreign key columns\n2. Index columns used in WHERE clauses\n3. Create composite indexes for multi-column queries\n4. Avoid over-indexing (each index slows down writes)';
    recommendations = [
      'Review foreign keys and add indexes if missing',
      'Analyze query patterns to identify missing indexes',
      'Use the SQL Generator to create index recommendations',
    ];
  } else if (lowerMessage.includes('foreign key') || lowerMessage.includes('fk') || lowerMessage.includes('relationship')) {
    response = 'Foreign keys establish relationships between tables. ';
    if (schemaContext && schemaContext.topIssues.length > 0) {
      const fkIssues = schemaContext.topIssues.filter((issue: any) => 
        issue.category?.toLowerCase().includes('foreign') || issue.title?.toLowerCase().includes('foreign')
      );
      if (fkIssues.length > 0) {
        response += `I found ${fkIssues.length} foreign key related issues:\n\n`;
        fkIssues.forEach((issue: any) => {
          response += `• ${issue.title}: ${issue.description}\n`;
        });
      }
    } else {
      response += 'Best practices:\n\n1. Always index foreign key columns\n2. Use appropriate cascade rules\n3. Ensure referential integrity\n4. Consider the impact on delete/update operations';
    }
    recommendations = [
      'Check that all foreign keys have corresponding indexes',
      'Review cascade rules for data integrity',
    ];
  } else if (lowerMessage.includes('table') && (lowerMessage.includes('create') || lowerMessage.includes('design'))) {
    response = 'When designing tables, consider:\n\n1. Normalize to reduce redundancy\n2. Choose appropriate data types\n3. Add primary keys to all tables\n4. Use foreign keys for relationships\n5. Consider future growth and scalability';
    recommendations = [
      'Review your table structure in the Schemas page',
      'Check for normalization opportunities',
    ];
  } else if (lowerMessage.includes('schema') || lowerMessage.includes('database')) {
    response = 'I can help you understand and optimize your database schema. ';
    if (schemaContext) {
      response += `Your current schema has ${schemaContext.tablesCount} tables and ${schemaContext.issuesCount} detected issues. `;
    }
    response += 'Use the following features:\n\n1. **Schemas Page**: Browse your database structure\n2. **Issues Page**: View detected schema problems\n3. **SQL Generator**: Get SQL recommendations\n4. **Compare Page**: Track schema changes over time';
    recommendations = [
      'Review detected issues in the Issues page',
      'Use SQL Generator to get optimization recommendations',
    ];
  } else {
    response = 'I can help you with:\n\n1. **Performance Optimization**: Ask about slow queries or optimization\n2. **Indexing**: Get advice on index strategies\n3. **Schema Design**: Learn about table design best practices\n4. **Foreign Keys**: Understand relationships and constraints\n5. **General Questions**: Ask about your database schema\n\nTry asking: "How can I optimize my database?" or "What indexes do I need?"';
  }

  logger.info('AI Assistant message processed', { message, databaseName, hasContext: !!schemaContext });

  return {
    id: `msg-${Date.now()}`,
    conversationId: conversationId || `conv-${Date.now()}`,
    role: 'assistant' as const,
    content: response,
    createdAt: new Date().toISOString(),
    recommendations: recommendations.length > 0 ? recommendations : undefined,
  };
};

