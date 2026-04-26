"use client";

/**
 * GitStagingArea — Visual three-zone staging diagram
 * Working Directory → Staging Area → Repository
 * Files animate between zones as user interacts.
 * Inspired by ohmygit and gitbybit.
 */

import { useState } from "react";
import { useEngineStyles } from "../useEngineStyles";
import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface StagingFile {
  name: string;
  status: "untracked" | "modified" | "staged" | "committed";
  icon?: string;
}

export interface GitStagingAreaProps {
  files: StagingFile[];
  hint?: string;
  tip?: string;
  /** If true, user can click to move files between zones */
  interactive?: boolean;
}

type Zone = "working" | "staged" | "committed";

function statusToZone(status: StagingFile["status"]): Zone {
  if (status === "staged") return "staged";
  if (status === "committed") return "committed";
  return "working";
}

const ZONE_META: Record<Zone, { label: string; cmd: string; color: string; border: string; icon: string }> = {
  working:   { label: "Working Directory", cmd: "git add",    color: T.slateAlpha(0.1),   border: T.slateAlpha(0.3),   icon: "📝" },
  staged:    { label: "Staging Area",      cmd: "git commit", color: T.amberAlpha(0.08),  border: T.amberAlpha(0.35),  icon: "📋" },
  committed: { label: "Repository",        cmd: "",           color: T.emeraldAlpha(0.08), border: T.emeraldAlpha(0.35), icon: "🏛️" },
};

export function GitStagingArea({ files, hint, tip, interactive = true }: GitStagingAreaProps) {
  useEngineStyles();
  const [zones, setZones] = useState<Record<string, Zone>>(() => {
    const map: Record<string, Zone> = {};
    files.forEach(f => { map[f.name] = statusToZone(f.status); });
    return map;
  });

  const advance = (name: string) => {
    if (!interactive) return;
    setZones(z => {
      const cur = z[name] ?? "working";
      const next: Zone = cur === "working" ? "staged" : cur === "staged" ? "committed" : "working";
      return { ...z, [name]: next };
    });
  };

  const filesByZone: Record<Zone, string[]> = { working: [], staged: [], committed: [] };
  files.forEach(f => filesByZone[zones[f.name] ?? "working"].push(f.name));

  return (
    <IllustrationShell hint={hint} gap={12}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 4, alignItems: "start" }}>
        {(["working", "staged", "committed"] as Zone[]).map((zone, zIdx) => {
          const meta = ZONE_META[zone];
          return (
            <>
              {/* Zone column */}
              <div
                key={zone}
                style={{
                  padding: 12, borderRadius: 12,
                  background: meta.color, border: `1.5px solid ${meta.border}`,
                  display: "flex", flexDirection: "column", gap: 8, minHeight: 100,
                }}
              >
                {/* Zone header */}
                <div style={{ fontSize: 10, fontWeight: 800, color: meta.border, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {meta.icon} {meta.label}
                </div>

                {/* Files in this zone */}
                {filesByZone[zone].map(name => {
                  const file = files.find(f => f.name === name);
                  return (
                    <div
                      key={name}
                      onClick={() => advance(name)}
                      style={{
                        padding: "7px 10px", borderRadius: 8,
                        background: meta.border.replace(/[\d.]+\)$/, "0.12)"),
                        border: `1px solid ${meta.border}`,
                        fontSize: 12, fontWeight: 600, color: T.text,
                        cursor: interactive && zone !== "committed" ? "pointer" : "default",
                        animation: "ie-pop-in 0.25s ease",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      <span>{file?.icon ?? (name.includes(".") ? "📄" : "📁")}</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                      {interactive && zone !== "committed" && (
                        <span style={{ fontSize: 10, color: meta.border }}>→</span>
                      )}
                    </div>
                  );
                })}

                {filesByZone[zone].length === 0 && (
                  <div style={{ fontSize: 11, color: T.muted, fontStyle: "italic", textAlign: "center", paddingTop: 8 }}>
                    Empty
                  </div>
                )}
              </div>

              {/* Arrow + command between zones */}
              {zIdx < 2 && (
                <div key={`arrow-${zone}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 0", alignSelf: "center" }}>
                  <span style={{ color: ZONE_META[zone].border, fontSize: 16 }}>→</span>
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.muted, textAlign: "center", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
                    {zone === "working" ? "git add" : "git commit"}
                  </div>
                </div>
              )}
            </>
          );
        })}
      </div>

      {interactive && (
        <div style={{ padding: "7px 12px", borderRadius: 8, background: T.indigoAlpha(0.07), border: `1px solid ${T.indigoAlpha(0.2)}`, fontSize: 11, color: T.muted, textAlign: "center" }}>
          💡 Click a file to move it through the stages
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
