"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

interface CodeBlockProps {
  /** The code content to display */
  code: string;
  /** Programming language for syntax highlighting context (display only) */
  language?: string;
  /** Enable the copy to clipboard button */
  copyable?: boolean;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Custom class name for the container */
  className?: string;
  /** Title/filename to display above the code block */
  title?: string;
  /** Maximum height before scrolling (e.g., "300px") */
  maxHeight?: string;
}

/**
 * CodeBlock component for displaying code snippets with copy functionality.
 * 
 * Follows the design system specification:
 * - Uses muted background with border
 * - Monospace font (JetBrains Mono)
 * - Copy button positioned top-right
 * - Optional line numbers and title
 */
export function CodeBlock({
  code,
  language,
  copyable = true,
  showLineNumbers = false,
  className,
  title,
  maxHeight,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, [code]);

  const lines = code.split("\n");

  return (
    <div
      className={cn(
        "relative rounded-md border border-border bg-muted/50",
        className
      )}
    >
      {/* Header with title and language badge */}
      {(title || language) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          {title && (
            <span className="text-sm font-medium text-foreground">{title}</span>
          )}
          {language && !title && (
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {language}
            </span>
          )}
          {language && title && (
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {language}
            </span>
          )}
        </div>
      )}

      {/* Code content */}
      <div className="relative">
        <pre
          className={cn(
            "overflow-x-auto p-4 font-mono text-sm leading-relaxed",
            maxHeight && "overflow-y-auto"
          )}
          style={maxHeight ? { maxHeight } : undefined}
        >
          {showLineNumbers ? (
            <code className="grid">
              {lines.map((line, index) => (
                <span key={index} className="inline-grid grid-cols-[auto_1fr] gap-4">
                  <span className="select-none text-muted-foreground text-right min-w-[2ch]">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{line || " "}</span>
                </span>
              ))}
            </code>
          ) : (
            <code className="text-foreground">{code}</code>
          )}
        </pre>

        {/* Copy button */}
        {copyable && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-2 top-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background",
              "border border-border shadow-sm",
              "transition-all duration-200",
              copied && "text-success"
            )}
            onClick={handleCopy}
            aria-label={copied ? "Copied!" : "Copy to clipboard"}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline code component for use within paragraphs.
 * Uses monospace font with subtle background.
 */
export function InlineCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        "rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground",
        className
      )}
    >
      {children}
    </code>
  );
}

export { type CodeBlockProps };
