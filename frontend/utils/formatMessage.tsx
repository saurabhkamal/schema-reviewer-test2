import React from 'react';

interface FormattedContentProps {
  content: string;
  isUser?: boolean;
}

/**
 * Formats AI assistant message content with proper headings, bullet points, and structure
 */
export function formatMessageContent(content: string, isUser: boolean = false): React.ReactNode[] {
  const textColor = isUser ? 'text-white' : 'text-text-primary';
  const elements: React.ReactNode[] = [];
  let elementKey = 0;

  // Process the content line by line
  const lines = content.split('\n');
  let currentList: string[] = [];
  let inList = false;

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Check for headings (lines that start and end with **, possibly with leading/trailing spaces)
    // Also handle headings that might be at the start of a line with some text
    const headingMatch = trimmed.match(/^\*\*(.+?)\*\*\s*$/);
    if (headingMatch) {
      // Flush any pending list
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${elementKey++}`} className={`mb-4 space-y-2.5 list-none pl-0 ${textColor}`}>
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-3 text-primary flex-shrink-0 mt-0.5 text-xl leading-none">•</span>
                <span className="flex-1 leading-relaxed">{formatInlineText(item, isUser)}</span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }

      // Render heading - remove ** markers and make it a proper heading
      const headingText = headingMatch[1].trim();
      elements.push(
        <h3
          key={`heading-${elementKey++}`}
          className={`text-2xl font-bold mb-4 mt-6 first:mt-0 ${textColor}`}
        >
          {headingText}
        </h3>
      );
      return;
    }

    // Check for bullet points (lines starting with * or - or •, with 1-4 spaces)
    // Handle cases like "*   **Data Inconsistency:** text" - the ** will be formatted as bold inline
    const bulletMatch = trimmed.match(/^[\*\-\•]\s{1,4}(.+)$/);
    if (bulletMatch) {
      if (!inList) {
        inList = true;
      }
      // Keep the content as-is, formatInlineText will handle **bold** formatting
      currentList.push(bulletMatch[1]);
      return;
    }

    // Check for numbered lists (lines starting with number.)
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      // Flush any pending bullet list
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${elementKey++}`} className={`mb-4 space-y-2.5 list-none pl-0 ${textColor}`}>
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-3 text-primary flex-shrink-0 mt-0.5 text-xl leading-none">•</span>
                <span className="flex-1 leading-relaxed">{formatInlineText(item, isUser)}</span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      // Numbered lists
      elements.push(
        <p key={`numbered-${elementKey++}`} className={`mb-2 ${textColor}`}>
          {formatInlineText(trimmed, isUser)}
        </p>
      );
      return;
    }

    // Regular text line
    if (trimmed) {
      // Flush any pending list
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${elementKey++}`} className={`mb-4 space-y-2.5 list-none pl-0 ${textColor}`}>
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-3 text-primary flex-shrink-0 mt-0.5 text-xl leading-none">•</span>
                <span className="flex-1 leading-relaxed">{formatInlineText(item, isUser)}</span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }

      elements.push(
        <p key={`text-${elementKey++}`} className={`mb-2 leading-relaxed ${textColor}`}>
          {formatInlineText(trimmed, isUser)}
        </p>
      );
    } else if (inList && currentList.length > 0) {
      // Empty line - flush list if we have items
      elements.push(
        <ul key={`list-${elementKey++}`} className={`mb-4 space-y-2.5 list-none pl-0 ${textColor}`}>
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start">
              <span className="mr-3 text-primary flex-shrink-0 mt-0.5 text-xl leading-none">•</span>
              <span className="flex-1 leading-relaxed">{formatInlineText(item, isUser)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
      inList = false;
    }
  });

  // Flush any remaining list items
  if (inList && currentList.length > 0) {
    elements.push(
      <ul key={`list-${elementKey++}`} className={`mb-4 space-y-2.5 list-none pl-0 ${textColor}`}>
        {currentList.map((item, idx) => (
          <li key={idx} className="flex items-start">
            <span className="mr-3 text-primary flex-shrink-0 mt-0.5 text-xl leading-none">•</span>
            <span className="flex-1 leading-relaxed">{formatInlineText(item, isUser)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return elements.length > 0 ? elements : [<p key="empty" className={`${textColor} leading-relaxed`}>{content}</p>];
}

/**
 * Formats inline text with bold (**text**) and code (`code`)
 */
function formatInlineText(text: string, isUser: boolean): React.ReactNode[] {
  const textColor = isUser ? 'text-white' : 'text-text-primary';
  const elements: React.ReactNode[] = [];
  
  // Handle bold text (**text**) and code (`code`) together
  // Use non-greedy matching to handle multiple bold/code sections
  const combinedRegex = /(\*\*.*?\*\*|`[^`]+`)/g;
  let match;
  let lastIndex = 0;
  let keyCounter = 0;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText) {
        elements.push(<React.Fragment key={`text-${keyCounter++}`}>{beforeText}</React.Fragment>);
      }
    }

    const matchedText = match[1];
    
    // Check if it's bold (**text**)
    if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      const boldText = matchedText.slice(2, -2);
      elements.push(
        <strong key={`bold-${keyCounter++}`} className={`font-semibold ${textColor}`}>
          {boldText}
        </strong>
      );
    }
    // Check if it's code (`code`)
    else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
      const codeText = matchedText.slice(1, -1);
      const codeColor = isUser ? 'bg-white/20 text-white' : 'bg-surface-dark text-text-primary';
      elements.push(
        <code
          key={`code-${keyCounter++}`}
          className={`px-1.5 py-0.5 rounded text-sm font-mono ${codeColor}`}
        >
          {codeText}
        </code>
      );
    }

    lastIndex = combinedRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      elements.push(<React.Fragment key={`text-${keyCounter++}`}>{remainingText}</React.Fragment>);
    }
  }

  return elements.length > 0 ? elements : [<React.Fragment key="plain">{text}</React.Fragment>];
}

