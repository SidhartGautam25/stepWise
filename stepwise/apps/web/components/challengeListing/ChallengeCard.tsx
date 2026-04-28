import { ChallengeSummary } from "@/lib/api";
import Link from "next/link";

const LANG_COLORS: Record<string, string> = {
    javascript: "#f59e0b",
    typescript: "#3b82f6",
    python: "#10b981",
    rust: "#ef4444",
    go: "#06b6d4",
};

export function ChallengeCard({ challenge: c }: { challenge: ChallengeSummary }) {
    const langColor = LANG_COLORS[c.language] ?? "#6c63ff";

    return (
        <Link href={`/challenges/${c.id}`} style={{ textDecoration: "none" }}>
            <div className="glass" style={{
                padding: "28px 28px 24px",
                transition: "all 0.2s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* colored left accent bar */}
                <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: 3, background: langColor,
                    borderRadius: "16px 0 0 16px",
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="badge" style={{
                            background: `${langColor}18`,
                            color: langColor,
                            border: `1px solid ${langColor}30`,
                        }}>
                            {c.language}
                        </span>
                        <span className="badge" style={{ background: "transparent", color: "var(--color-muted)", border: "1px solid var(--color-border-strong)" }}>
                            {c.runtime}
                        </span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>v{c.version}</span>
                </div>

                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                    {c.title}
                </h2>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {Array.from({ length: c.stepCount }).map((_, i) => (
                            <div key={i} style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: i === 0 ? "var(--color-indigo)" : "var(--color-border-strong)",
                            }} />
                        ))}
                        <span style={{ fontSize: 12, color: "var(--color-muted)", marginLeft: 8 }}>
                            {c.stepCount} step{c.stepCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--color-indigo)", fontWeight: 600 }}>
                        Start →
                    </span>
                </div>
            </div>
        </Link>
    );
}
