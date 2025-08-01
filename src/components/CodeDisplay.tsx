import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Code } from "lucide-react";
import { toast } from "sonner";

interface CodeDisplayProps {
  code: string;
  language?: string;
  fileName?: string;
}

export const CodeDisplay = ({ code, language = "javascript", fileName }: CodeDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  // Use the language prop if provided, otherwise try to detect
  const detectLanguage = (codeString: string, lang?: string): string => {
    if (lang && lang !== "") return lang;
    if (codeString.includes('import React') || codeString.includes('export const') || codeString.includes('useState')) return 'typescript';
    if (codeString.includes('def ') || codeString.includes('import ')) return 'python';
    if (codeString.includes('public class') || codeString.includes('System.out')) return 'java';
    if (codeString.includes('#include') || codeString.includes('int main')) return 'cpp';
    if (codeString.includes('SELECT') || codeString.includes('CREATE TABLE')) return 'sql';
    if (codeString.includes('<html>') || codeString.includes('<div>')) return 'html';
    if (codeString.includes('{') && codeString.includes('}')) return 'css';
    return 'plaintext';
  };

  const detectedLanguage = detectLanguage(code, language);

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {fileName || `${detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)} Code`}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="ml-1 text-xs">
            {copied ? "Copied" : "Copy"}
          </span>
        </Button>
      </div>

      {/* Code Content */}
      <div className="relative">
        <pre
          className="m-0 p-4 bg-card text-foreground text-sm leading-relaxed overflow-x-auto"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          }}
        >
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};