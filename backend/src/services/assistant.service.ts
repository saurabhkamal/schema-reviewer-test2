import { logger } from '../utils/logger';
import { getRankedIssues } from './scoring.service';
import { getImpactScore } from './scoring.service';
import { getLatestSnapshot } from './schema.service';
import { generateAIExplanation, generateAIExplanationWithCrewAI } from './llm.service';
import { loadKnowledgeBaseText } from './knowledge.service';
import {
  createConversation,
  getConversationById,
  addMessageToConversation,
} from './conversation.service';

export const sendMessage = async (
  message: string,
  databaseName?: string,
  conversationId?: string,
  userId?: string
) => {
  const lowerMessage = message.toLowerCase();
  const knowledgeBaseText = loadKnowledgeBaseText();

  // Get schema context if database is provided
  let schemaContext: any = null;
  let healthScore: number | undefined = undefined;

  if (databaseName) {
    try {
      const snapshot = await getLatestSnapshot(databaseName);
      if (snapshot) {
        try {
          const issues = await getRankedIssues(snapshot.snapshotId, 10);
          const tableNames = snapshot.tables?.map((table: any) => table.name) || [];
          
          // Get health score
          try {
            const impactData = await getImpactScore(snapshot.snapshotId);
            healthScore = impactData.healthScore;
          } catch (error) {
            logger.warn('Failed to get health score', { 
              error: error instanceof Error ? error.message : String(error) 
            });
          }

          // Build detailed table information with column counts
          const tablesWithDetails = snapshot.tables?.map((table: any) => ({
            name: table.name,
            columnCount: table.columns?.length || 0,
            rowCount: table.rowCount || null,
            hasPrimaryKey: table.columns?.some((col: any) => col.isPrimaryKey) || false,
            hasIndexes: (table.indexes?.length || 0) > 0,
            indexCount: table.indexes?.length || 0,
            foreignKeyCount: table.foreignKeys?.length || 0,
          })) || [];

          schemaContext = {
            databaseName: databaseName,
            tablesCount: snapshot.tables?.length || 0,
            tableNames: tableNames,
            tablesWithDetails: tablesWithDetails,
            issuesCount: issues?.length || 0,
            topIssues: issues?.slice(0, 10).map((issue: any) => ({
              tableName: issue.table?.name,
              columnName: issue.columnName,
              severity: issue.severity,
              category: issue.category,
              title: issue.title,
              description: issue.description,
              recommendation: issue.recommendation,
            })),
            healthScore: healthScore,
          };
        } catch (error) {
          logger.warn('Failed to get ranked issues for assistant context', { 
            snapshotId: snapshot.snapshotId, 
            error: error instanceof Error ? error.message : String(error) 
          });
          const tableNames = snapshot.tables?.map((table: any) => table.name) || [];
          const tablesWithDetails = snapshot.tables?.map((table: any) => ({
            name: table.name,
            columnCount: table.columns?.length || 0,
            rowCount: table.rowCount || null,
            hasPrimaryKey: table.columns?.some((col: any) => col.isPrimaryKey) || false,
            hasIndexes: (table.indexes?.length || 0) > 0,
            indexCount: table.indexes?.length || 0,
            foreignKeyCount: table.foreignKeys?.length || 0,
          })) || [];
          
          schemaContext = {
            databaseName: databaseName,
            tablesCount: snapshot.tables?.length || 0,
            tableNames: tableNames,
            tablesWithDetails: tablesWithDetails,
            issuesCount: 0,
            topIssues: [],
            healthScore: undefined,
          };
        }
      }
    } catch (error) {
      logger.warn('Failed to get schema snapshot for assistant context', { 
        databaseName, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  // Handle conversation creation/retrieval if userId is provided
  let actualConversationId = conversationId;
  if (userId) {
    try {
      if (!conversationId) {
        // Create new conversation
        const newConversation = await createConversation({
          userId,
          databaseName,
        });
        actualConversationId = newConversation.id;
      } else {
        // Verify conversation exists and belongs to user
        const existingConversation = await getConversationById(conversationId, userId);
        if (!existingConversation) {
          // Create new conversation if not found
          const newConversation = await createConversation({
            userId,
            databaseName,
          });
          actualConversationId = newConversation.id;
        }
      }

      // Save user message
      await addMessageToConversation({
        conversationId: actualConversationId!,
        role: 'USER',
        content: message,
      });
    } catch (error) {
      logger.warn('Failed to save conversation/message', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        conversationId,
      });
      // Continue without saving if there's an error
    }
  }

  // Special case: Questions about tables with too many columns
  const isTooManyColumnsQuestion = 
    (lowerMessage.includes('too many column') || 
     lowerMessage.includes('many column') ||
     (lowerMessage.includes('which table') && (lowerMessage.includes('column') || lowerMessage.includes('col'))) ||
     (lowerMessage.includes('what table') && (lowerMessage.includes('column') || lowerMessage.includes('col'))));

  // Special case: Simple table listing (fast, no LLM needed)
  const isTableListRequest = 
    ((lowerMessage.includes('show') || lowerMessage.includes('list') || lowerMessage.includes('display') || lowerMessage.includes('what')) &&
     (lowerMessage.includes('table') || lowerMessage.includes('tables'))) ||
    (lowerMessage.includes('all') && lowerMessage.includes('table')) ||
    (lowerMessage.includes('table') && (lowerMessage.includes('name') || lowerMessage.includes('names'))) ||
    (lowerMessage.includes('what') && lowerMessage.includes('table')) ||
    (lowerMessage.includes('which') && lowerMessage.includes('table'));

  // Handle "too many columns" questions with direct answer
  if (isTooManyColumnsQuestion && schemaContext && schemaContext.tablesWithDetails) {
    // Sort all tables by column count (descending) to show the answer directly
    const allTablesSorted = [...schemaContext.tablesWithDetails]
      .sort((a: any, b: any) => b.columnCount - a.columnCount);
    
    const tablesWithManyColumns = allTablesSorted.filter((table: any) => table.columnCount > 30);

    // Provide direct answer: list tables with their column counts
    let response = '';
    if (tablesWithManyColumns.length > 0) {
      response = `**Tables with more than 30 columns:**\n\n`;
      tablesWithManyColumns.forEach((table: any, idx: number) => {
        response += `${idx + 1}. **${table.name}** - ${table.columnCount} columns\n`;
      });
      response += `\n**Answer:** ${tablesWithManyColumns.length} table(s) with excessive columns.`;
    } else {
      // Direct answer: None, but still show the table with most columns for context
      if (allTablesSorted.length > 0) {
        const topTable = allTablesSorted[0];
        response = `**Answer:** None. No tables have more than 30 columns.\n\n**Table with most columns:** ${topTable.name} (${topTable.columnCount} columns)`;
      } else {
        response = `**Answer:** None. No tables found in the database.`;
      }
    }

    const assistantResponse = {
      id: `msg-${Date.now()}`,
      conversationId: actualConversationId || `conv-${Date.now()}`,
      role: 'assistant' as const,
      content: response,
      createdAt: new Date().toISOString(),
      recommendations: tablesWithManyColumns.length > 0 ? [
        'Consider normalizing tables with more than 30 columns',
        'Split large tables into smaller, related tables',
      ] : [],
      sqlSuggestions: [],
    };

    // Save assistant response if userId is provided
    if (userId && actualConversationId) {
      try {
        await addMessageToConversation({
          conversationId: actualConversationId,
          role: 'ASSISTANT',
          content: response,
          recommendations: assistantResponse.recommendations,
          sqlSuggestions: [],
        });
      } catch (error) {
        logger.warn('Failed to save assistant message', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return assistantResponse;
  }

  if (isTableListRequest) {
    let assistantResponse: any;
    
    if (schemaContext && schemaContext.tableNames && schemaContext.tableNames.length > 0) {
      let response = `Here are all the tables in your **${databaseName || 'database'}** schema:\n\n`;
      schemaContext.tableNames.forEach((tableName: string, idx: number) => {
        response += `${idx + 1}. ${tableName}\n`;
      });
      response += `\n**Total: ${schemaContext.tablesCount} tables**`;
      
      assistantResponse = {
        id: `msg-${Date.now()}`,
        conversationId: actualConversationId || `conv-${Date.now()}`,
        role: 'assistant' as const,
        content: response,
        createdAt: new Date().toISOString(),
        recommendations: [
          'View detailed table structure in the Schemas page',
          'Check for issues in specific tables using the Issues page',
        ],
        sqlSuggestions: [],
      };
    } else if (databaseName) {
      assistantResponse = {
        id: `msg-${Date.now()}`,
        conversationId: actualConversationId || `conv-${Date.now()}`,
        role: 'assistant' as const,
        content: `I couldn't find any tables in the **${databaseName}** database. Please make sure:\n\n1. The database schema has been uploaded\n2. The database name is correct\n3. The schema contains at least one table`,
        createdAt: new Date().toISOString(),
        recommendations: ['Upload your schema first', 'Verify the database name'],
        sqlSuggestions: [],
      };
    } else {
      assistantResponse = {
        id: `msg-${Date.now()}`,
        conversationId: actualConversationId || `conv-${Date.now()}`,
        role: 'assistant' as const,
        content: 'To show table names, please select a database first. You can select a database from the sidebar or specify the database name in your question.',
        createdAt: new Date().toISOString(),
        recommendations: [
          'Select a database from the sidebar',
          'Or ask: "Show tables in [database name]"',
        ],
        sqlSuggestions: [],
      };
    }

    // Save assistant response if userId is provided
    if (userId && actualConversationId) {
      try {
        await addMessageToConversation({
          conversationId: actualConversationId,
          role: 'ASSISTANT',
          content: assistantResponse.content,
          recommendations: assistantResponse.recommendations,
          sqlSuggestions: assistantResponse.sqlSuggestions || [],
        });
      } catch (error) {
        logger.warn('Failed to save assistant message', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return assistantResponse;
  }

  // For all other queries, use AI-powered LLM explanation
  // Use CrewAI for complex queries (those with schema context or multiple issues)
  // Otherwise use LangChain for faster responses
  try {
    const useCrewAI = schemaContext && (schemaContext.issuesCount > 0 || schemaContext.tablesCount > 5);
    const llmResponse = useCrewAI
      ? await generateAIExplanationWithCrewAI(message, schemaContext, knowledgeBaseText)
      : await generateAIExplanation(message, schemaContext, knowledgeBaseText);

    // Combine explanation with SQL suggestions and recommendations
    let content = llmResponse.explanation;

    // Add SQL suggestions if available
    if (llmResponse.sqlSuggestions && llmResponse.sqlSuggestions.length > 0) {
      content += '\n\n## SQL Suggestions\n\n';
      llmResponse.sqlSuggestions.forEach((sql, idx) => {
        content += `### SQL ${idx + 1}\n\`\`\`sql\n${sql}\n\`\`\`\n\n`;
      });
    }

    // Combine recommendations
    const allRecommendations = [
      ...(llmResponse.recommendations || []),
      ...(llmResponse.sqlSuggestions && llmResponse.sqlSuggestions.length > 0 
        ? ['Review and test SQL suggestions before applying to production'] 
        : []),
    ];

    logger.info('AI Assistant message processed with LLM', { 
      message, 
      databaseName, 
      hasContext: !!schemaContext,
      hasSQL: llmResponse.sqlSuggestions.length > 0,
    });

    const assistantResponse = {
      id: `msg-${Date.now()}`,
      conversationId: actualConversationId || `conv-${Date.now()}`,
      role: 'assistant' as const,
      content: content,
      createdAt: new Date().toISOString(),
      recommendations: allRecommendations.length > 0 ? allRecommendations : undefined,
      sqlSuggestions: llmResponse.sqlSuggestions.length > 0 ? llmResponse.sqlSuggestions : undefined,
    };

    // Save assistant response if userId is provided
    if (userId && actualConversationId) {
      try {
        await addMessageToConversation({
          conversationId: actualConversationId,
          role: 'ASSISTANT',
          content: content,
          recommendations: allRecommendations.length > 0 ? allRecommendations : undefined,
          sqlSuggestions: llmResponse.sqlSuggestions.length > 0 ? llmResponse.sqlSuggestions : undefined,
        });
      } catch (error) {
        logger.warn('Failed to save assistant message', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return assistantResponse;
  } catch (error) {
    logger.error('Failed to generate AI response in assistant service', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
    });

    // Provide helpful error message
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMsg.includes('timeout') || errorMsg.includes('timed out');
    const isNetwork = errorMsg.includes('network') || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('fetch');

    let content = `I encountered an error while processing your request: ${errorMsg}`;
    
    if (isTimeout) {
      content += '\n\nThe request timed out. This can happen with complex queries. Please try again.';
    } else if (isNetwork) {
      content += '\n\nNetwork error detected. Please check:\n1. Backend server is running\n2. Network connectivity\n3. Backend logs for details';
    } else {
      content += '\n\nPlease try again or check the backend logs for more details.';
    }

    // Fallback response
    const errorResponse = {
      id: `msg-${Date.now()}`,
      conversationId: actualConversationId || `conv-${Date.now()}`,
      role: 'assistant' as const,
      content: content,
      createdAt: new Date().toISOString(),
      recommendations: [
        'Check backend server is running',
        'Verify API key configuration',
        'Check backend logs for detailed errors',
        'Try rephrasing your question',
      ],
      sqlSuggestions: [],
    };

    // Save error response if userId is provided
    if (userId && actualConversationId) {
      try {
        await addMessageToConversation({
          conversationId: actualConversationId,
          role: 'ASSISTANT',
          content: content,
          recommendations: errorResponse.recommendations,
          sqlSuggestions: [],
        });
      } catch (error) {
        logger.warn('Failed to save error message', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return errorResponse;
  }
};
