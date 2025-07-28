import { CodeDisplay } from "./CodeDisplay";

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export const MessageContent = ({ content, isUser }: MessageContentProps) => {
  // Parse message to separate text and code blocks
  const parseMessage = (text: string) => {
    const parts = [];
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textContent = text.slice(lastIndex, match.index).trim();
        if (textContent) {
          parts.push({ type: 'text', content: textContent });
        }
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      if (code) {
        parts.push({ type: 'code', content: code, language });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textContent = text.slice(lastIndex).trim();
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const parts = parseMessage(content);

  if (isUser || parts.every(part => part.type === 'text')) {
    // For user messages or messages without code, render normally
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  // For AI messages with code, render with separated code blocks
  return (
    <div className="space-y-4">
      {parts.map((part, index) => (
        <div key={index}>
          {part.type === 'text' ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {part.content}
            </p>
          ) : (
            <CodeDisplay 
              code={part.content} 
              language={part.language}
            />
          )}
        </div>
      ))}
    </div>
  );
};