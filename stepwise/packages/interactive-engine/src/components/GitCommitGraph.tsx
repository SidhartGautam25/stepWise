"use client";

/**
 * GitCommitGraph — Visual DAG of git commits
 * Inspired by learngitbranching's clean commit graph.
 * Shows commits as circles on a timeline, with branch labels.
 */

import { useState } from "react";
import { useEngineStyles } from "../useEngineStyles";
import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface CommitNode {
  id: string;
  message: string;
  branch: string;
  color?: string;
  border?: string;
  isHead?: boolean;
  detail?: string;
}

export interface GitBranchLine {
  name: string;
  color: string;
  commits: string[];   // commit ids in this branch
}

export interface GitCommitGraphProps {
  commits: CommitNode[];
  branches?: GitBranchLine[];
  hint?: string;
  tip?: string;
}

const DEFAULT_COLORS = [
  { color: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.6)"  },
  { color: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.6)" },
  { color: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.6)" },
  { color: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.6)" },
];

export function GitCommitGraph({ commits, branches, hint, tip }: GitCommitGraphProps) {
  useEngineStyles();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = commits.find(c => c.id === activeId);

  // Group commits by branch for layout
  const branchNames = [...new Set(commits.map(c => c.branch))];

  return (
    <IllustrationShell hint={hint} gap={12}>
      {/* Branch lanes */}
      {branchNames.map((branch, bIdx) => {
        const branchCommits = commits.filter(c => c.branch === branch);
        const palette = DEFAULT_COLORS[bIdx % DEFAULT_COLORS.length]!;
        return (
          <div key={branch}>
            {/* Branch label */}
            <div style={{ fontSize: 10, fontWeight: 800, color: palette.border, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              ⎇ {branch}
            </div>

            {/* Commit row */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
              {branchCommits.map((commit, idx) => (
                <div key={commit.id} style={{ display: "flex", alignItems: "center" }}>
                  {/* Connector line */}
                  {idx > 0 && (
                    <div style={{ width: 32, height: 2, background: `linear-gradient(90deg, ${palette.border}, ${palette.border})`, opacity: 0.4 }} />
                  )}

                  {/* Commit node */}
                  <div
                    onClick={() => setActiveId(activeId === commit.id ? null : commit.id)}
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      transition: "transform 0.2s",
                      transform: activeId === commit.id ? "scale(1.12)" : "scale(1)",
                    }}
                  >
                    {/* HEAD badge */}
                    {commit.isHead && (
                      <div style={{
                        position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                        fontSize: 9, fontWeight: 900, background: T.emerald, color: "#000",
                        padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap",
                      }}>
                        HEAD
                      </div>
                    )}

                    {/* Circle */}
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: commit.color ?? palette.color,
                      border: `2px solid ${commit.border ?? palette.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 900, color: commit.border ?? palette.border,
                      boxShadow: activeId === commit.id ? `0 0 12px ${commit.border ?? palette.border}` : "none",
                      transition: "box-shadow 0.3s",
                    }}>
                      {commit.id.slice(0, 4)}
                    </div>

                    {/* Message */}
                    <div style={{ fontSize: 10, color: T.muted, maxWidth: 72, textAlign: "center", lineHeight: 1.3, wordBreak: "break-word" }}>
                      {commit.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Detail popup */}
      {active?.detail && (
        <div style={{
          padding: "10px 14px", borderRadius: 10,
          background: T.indigoAlpha(0.08), border: `1px solid ${T.indigoAlpha(0.3)}`,
          fontSize: 12, color: T.body, animation: "ie-slide-in 0.2s ease",
        }}>
          <span style={{ fontWeight: 700, color: T.indigo }}>{active.id}</span>{" — "}{active.detail}
        </div>
      )}

      {tip && (
        <div style={{ padding: "8px 12px", borderRadius: 9, background: T.pillBg, border: `1px solid ${T.pillBorder}`, fontSize: 11, color: T.pillText, textAlign: "center" }}>
          {tip}
        </div>
      )}
    </IllustrationShell>
  );
}
