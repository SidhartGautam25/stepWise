"use client";

import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface CommandTableRow {
  command: string;
  meaning: string;
  note?: string;
}

export interface CommandTableProps {
  rows: CommandTableRow[];
  hint?: string;
  commandLabel?: string;
  meaningLabel?: string;
  noteLabel?: string;
}

export function CommandTable({
  rows,
  hint,
  commandLabel = "Command",
  meaningLabel = "Meaning",
  noteLabel = "Note",
}: CommandTableProps) {
  const hasNotes = rows.some((row) => row.note);

  return (
    <IllustrationShell hint={hint} gap={0}>
      <div
        style={{
          overflow: "hidden",
          borderRadius: 12,
          border: `1px solid ${T.cardBorder}`,
          background: T.cardBg,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: hasNotes ? "minmax(120px, 0.8fr) 1.3fr 1fr" : "minmax(120px, 0.8fr) 1.6fr",
            gap: 0,
            background: T.indigoAlpha(0.08),
            borderBottom: `1px solid ${T.indigoAlpha(0.18)}`,
          }}
        >
          <HeaderCell>{commandLabel}</HeaderCell>
          <HeaderCell>{meaningLabel}</HeaderCell>
          {hasNotes && <HeaderCell>{noteLabel}</HeaderCell>}
        </div>

        {rows.map((row, index) => (
          <div
            key={`${row.command}-${index}`}
            style={{
              display: "grid",
              gridTemplateColumns: hasNotes ? "minmax(120px, 0.8fr) 1.3fr 1fr" : "minmax(120px, 0.8fr) 1.6fr",
              borderBottom: index === rows.length - 1 ? "none" : `1px solid ${T.cardBorder}`,
            }}
          >
            <div style={cellStyle}>
              <code
                style={{
                  display: "inline-block",
                  padding: "4px 7px",
                  borderRadius: 7,
                  background: T.slateAlpha(0.10),
                  border: `1px solid ${T.slateAlpha(0.18)}`,
                  color: T.text,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {row.command}
              </code>
            </div>
            <div style={cellStyle}>{row.meaning}</div>
            {hasNotes && <div style={{ ...cellStyle, color: T.muted }}>{row.note ?? ""}</div>}
          </div>
        ))}
      </div>
    </IllustrationShell>
  );
}

function HeaderCell({ children }: { children: string }) {
  return (
    <div
      style={{
        padding: "9px 12px",
        color: T.kicker,
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

const cellStyle = {
  padding: "11px 12px",
  color: T.body,
  fontSize: 12,
  lineHeight: 1.55,
  minWidth: 0,
};
