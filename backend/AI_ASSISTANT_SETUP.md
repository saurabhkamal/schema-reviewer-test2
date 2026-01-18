# AI Assistant Setup Guide

## Overview

The AI Assistant feature uses Google's Gemini AI models to provide natural-language explanations and executable SQL suggestions for database schema optimization.

## Prerequisites

1. **Gemini API Key**: You need a Google AI API key
   - Get your API key from: https://makersuite.google.com/app/apikey
   - Or from Google AI Studio: https://aistudio.google.com/app/apikey

## Configuration

### 1. Add Gemini API Key to Environment Variables

Add the following to your `backend/.env` file:

```env
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash
```

**Recommended Models:**
- `gemini-1.5-flash` - Fast, cost-effective (recommended)
- `gemini-1.5-pro` - More capable, higher cost
- `gemini-pro` - Alternative option

### 2. Restart the Backend Server

After adding the API key, restart your backend server:

```bash
cd backend
npm run dev
```

## How It Works

### 1. Knowledge Base

The system includes a comprehensive knowledge base stored in `backend/src/knowledge/`:
- **indexing.json** - Indexing strategies and best practices
- **normalization.json** - Database normalization rules
- **query_design.json** - Query design patterns
- **foreign_keys.json** - Foreign key best practices
- **data_types.json** - Data type selection guidelines

### 2. AI Explanation Layer

When you ask a question:
1. The system loads your database schema context (tables, issues, health score)
2. It loads the knowledge base
3. It sends your question + context + knowledge base to Google Gemini AI
4. The LLM generates:
   - **Natural-language explanations** of issues
   - **Executable SQL statements** to fix problems
   - **Prioritized recommendations** with reasoning

### 3. Response Format

The AI Assistant returns:
- **Explanation**: Clear, human-readable explanation of the issue
- **SQL Suggestions**: Executable PostgreSQL SQL statements
- **Recommendations**: Actionable steps with reasoning

## Usage Examples

### Example Questions:

1. **"How can I optimize my database?"**
   - Analyzes your schema
   - Identifies performance issues
   - Provides SQL to fix them
   - Explains why each fix helps

2. **"What indexes do I need?"**
   - Reviews your schema
   - Identifies missing indexes
   - Generates CREATE INDEX statements
   - Explains index strategy

3. **"Explain the foreign key issues"**
   - Lists foreign key problems
   - Explains impact
   - Provides SQL to add indexes
   - Gives best practices

4. **"Why is my schema slow?"**
   - Analyzes performance issues
   - Explains root causes
   - Provides optimization SQL
   - Prioritizes fixes

## Features

✅ **Natural-language explanations** - Understand why issues exist  
✅ **Executable SQL suggestions** - Ready-to-use PostgreSQL statements  
✅ **Context-aware responses** - Uses your actual schema data  
✅ **Knowledge-based advice** - Grounded in database best practices  
✅ **Copy-to-clipboard** - Easy SQL copying in the UI  
✅ **Error handling** - Graceful fallbacks if API is unavailable  

## Troubleshooting

### "AI-powered explanations require a Gemini API key"

**Solution**: Add `GEMINI_API_KEY` to your `backend/.env` file

### "I tried to generate a detailed explanation, but an internal error occurred"

**Possible causes:**
1. Invalid API key
2. Network connectivity issues
3. Gemini API rate limits
4. Invalid model name

**Solutions:**
- Verify your API key is correct
- Check your internet connection
- Check Google AI status
- Verify the model name in `.env`

### API Costs

Google Gemini pricing:
- **Input tokens** (your question + context)
- **Output tokens** (AI response)
- **Model used** (gemini-1.5-flash is most cost-effective)

**Cost estimation** (gemini-1.5-flash):
- Free tier available (generous limits)
- Pay-as-you-go pricing for higher usage
- Typical query: Very low cost or free on free tier

Check current pricing: https://ai.google.dev/pricing

## Fallback Mode

If Gemini API is not configured, the system will:
- Still work for simple queries (e.g., "show tables")
- Display a message about API configuration
- Provide basic pattern-matching responses

## Knowledge Base Customization

You can customize the knowledge base by editing JSON files in `backend/src/knowledge/`:
- Add your own best practices
- Include company-specific guidelines
- Update with latest PostgreSQL features

After changes, restart the backend server to reload the knowledge base.

## Security Notes

⚠️ **Never commit your API key to version control**
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate API keys regularly
- The provided API key should be kept secure

## Support

For issues or questions:
1. Check backend logs for error messages
2. Verify API key configuration
3. Test API key directly with Google AI Studio
4. Review knowledge base files for syntax errors
5. Check Gemini API quotas and limits