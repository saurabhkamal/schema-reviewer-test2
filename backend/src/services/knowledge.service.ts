import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

let cachedText: string | null = null;

export function loadKnowledgeBaseText(): string {
  if (cachedText) return cachedText;

  try {
    const baseDir = path.join(__dirname, '..', 'knowledge');
    
    // Check if knowledge directory exists
    if (!fs.existsSync(baseDir)) {
      logger.warn('Knowledge base directory not found', { baseDir });
      cachedText = 'No knowledge base available.';
      return cachedText;
    }

    const files = fs.readdirSync(baseDir).filter((f) => f.endsWith('.json'));

    if (files.length === 0) {
      logger.warn('No knowledge base files found', { baseDir });
      cachedText = 'No knowledge base files available.';
      return cachedText;
    }

    const docs: any[] = files.map((file) => {
      try {
        const fullPath = path.join(baseDir, file);
        const raw = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(raw);
      } catch (error) {
        logger.error('Failed to load knowledge base file', { 
          file, 
          error: error instanceof Error ? error.message : String(error) 
        });
        return null;
      }
    }).filter((doc) => doc !== null);

    if (docs.length === 0) {
      cachedText = 'No valid knowledge base files found.';
      return cachedText;
    }

    cachedText = docs
      .map((doc) => {
        const topic = doc.topic || 'General';
        const sections: string[] = [];
        
        if (doc.principles && Array.isArray(doc.principles)) {
          sections.push(`PRINCIPLES:\n${doc.principles.map((p: string) => `- ${p}`).join('\n')}`);
        }
        if (doc.rules && Array.isArray(doc.rules)) {
          sections.push(`RULES:\n${doc.rules.map((r: string) => `- ${r}`).join('\n')}`);
        }
        if (doc.bestPractices && Array.isArray(doc.bestPractices)) {
          sections.push(`BEST PRACTICES:\n${doc.bestPractices.map((bp: string) => `- ${bp}`).join('\n')}`);
        }
        if (doc.antiPatterns && Array.isArray(doc.antiPatterns)) {
          sections.push(`ANTI-PATTERNS (AVOID):\n${doc.antiPatterns.map((ap: string) => `- ${ap}`).join('\n')}`);
        }
        if (doc.commonMistakes && Array.isArray(doc.commonMistakes)) {
          sections.push(`COMMON MISTAKES:\n${doc.commonMistakes.map((cm: string) => `- ${cm}`).join('\n')}`);
        }
        if (doc.performanceTips && Array.isArray(doc.performanceTips)) {
          sections.push(`PERFORMANCE TIPS:\n${doc.performanceTips.map((pt: string) => `- ${pt}`).join('\n')}`);
        }
        if (doc.benefits && Array.isArray(doc.benefits)) {
          sections.push(`BENEFITS:\n${doc.benefits.map((b: string) => `- ${b}`).join('\n')}`);
        }
        if (doc.whenToDenormalize && Array.isArray(doc.whenToDenormalize)) {
          sections.push(`WHEN TO DENORMALIZE:\n${doc.whenToDenormalize.map((wtd: string) => `- ${wtd}`).join('\n')}`);
        }
        if (doc.performanceConsiderations && Array.isArray(doc.performanceConsiderations)) {
          sections.push(`PERFORMANCE CONSIDERATIONS:\n${doc.performanceConsiderations.map((pc: string) => `- ${pc}`).join('\n')}`);
        }
        if (doc.performanceImpact && Array.isArray(doc.performanceImpact)) {
          sections.push(`PERFORMANCE IMPACT:\n${doc.performanceImpact.map((pi: string) => `- ${pi}`).join('\n')}`);
        }

        return `=== ${topic} ===\n${sections.join('\n\n')}`;
      })
      .join('\n\n');

    logger.info('Knowledge base loaded successfully', { 
      filesCount: files.length, 
      topicsCount: docs.length 
    });

    return cachedText;
  } catch (error) {
    logger.error('Failed to load knowledge base', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    cachedText = 'No knowledge base available due to loading error.';
    return cachedText;
  }
}

export function clearKnowledgeBaseCache(): void {
  cachedText = null;
}
