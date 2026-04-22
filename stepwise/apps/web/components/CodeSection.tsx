"use client";

import { useState } from "react";
import type { CodeFile } from "@/lib/api";

interface CodeSectionProps {
  files?: CodeFile[];
}

export function CodeSection({ files }: CodeSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = files && files[activeIndex] ? files[activeIndex] : null;

  if (!files || files.length === 0 || !activeFile) return null;

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.finalCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      marginBottom: 40,
      background: "var(--color-surface)",
      borderRadius: 12,
      border: "1px solid var(--color-border)",
      overflow: "hidden"
    }}>
      {/* Header Tabs */}
      <div style={{
        display: "flex", 
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", flex: 1, background: "var(--color-bg)" }}>
          {files.map((file, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                padding: "12px 24px",
                background: activeIndex === idx ? "var(--color-surface)" : "var(--color-bg)",
                border: "none",
                borderRight: "1px solid var(--color-border)",
                borderBottom: "none",
                borderTop: activeIndex === idx ? "2px solid var(--color-indigo)" : "2px solid transparent",
                color: activeIndex === idx ? "var(--color-text)" : "var(--color-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: activeIndex === idx ? 600 : 400,
                outline: "none"
              }}
            >
              {file.filename}
            </button>
          ))}
          <div style={{ flex: 1, borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }} />
        </div>

        {/* Action Button */}
        <div style={{ 
          background: "var(--color-bg)", 
          display: "flex", 
          justifyContent: "flex-end", 
          alignItems: "center", 
          padding: "0 16px",
          borderBottom: "1px solid var(--color-border)"
        }}>
           <button 
             onClick={handleCopy}
             style={{ 
               fontSize: 12, padding: "6px 12px", 
               background: copied ? "var(--color-emerald-muted)" : "var(--color-surface)", 
               color: copied ? "var(--color-emerald)" : "var(--color-text)",
               border: copied ? "1px solid var(--color-emerald)" : "1px solid var(--color-border)",
               borderRadius: 6,
               cursor: "pointer",
               fontWeight: 600,
               transition: "all 0.2s"
             }}>
             {copied ? "✓ Copied!" : "📋 Copy Final Code"}
           </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div style={{ padding: "20px 0", overflowX: "auto", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6, background: "var(--color-surface)" }}>
        {activeFile.diffContent.split('\n').map((line, i) => {
          let bg = "transparent";
          let color = "var(--color-text)";
          let prefix = "  ";

          if (line.startsWith("+")) {
            bg = "rgba(16, 185, 129, 0.15)";
            color = "var(--color-emerald)";
            prefix = "+ ";
            line = line.substring(1);
          } else if (line.startsWith("-")) {
            bg = "rgba(239, 68, 68, 0.15)";
            color = "#ef4444"; 
            prefix = "- ";
            line = line.substring(1);
          } else if (line.startsWith(" ")) {
            line = line.substring(1);
          }

          return (
            <div key={i} style={{ 
              display: "flex", 
              background: bg,
              padding: "0 24px",
              whiteSpace: "pre"
            }}>
              <span style={{ color: "var(--color-muted)", marginRight: 16, userSelect: "none", opacity: 0.5 }}>{prefix}</span>
              <span style={{ color }}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
