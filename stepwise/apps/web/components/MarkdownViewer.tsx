"use client";

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = match || String(children).includes("\n");

            if (isBlock) {
              const codeString = String(children).replace(/\n$/, "");
              const lines = codeString.split("\n");

              return (
                <code className={className} style={{ display: "block", background: "transparent", padding: 0 }} {...props}>
                  {lines.map((line, i) => {
                    let lineClass = "diff-line";
                    if (line.startsWith("+ ")) {
                      lineClass += " diff-add";
                    } else if (line.startsWith("- ")) {
                      lineClass += " diff-remove";
                    }

                    return (
                      <span key={i} className={lineClass}>
                        {line}
                        {"\n"}
                      </span>
                    );
                  })}
                </code>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
