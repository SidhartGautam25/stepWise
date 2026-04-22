import Link from "next/link";
import { fetchChallenges, type ChallengeSummary } from "@/lib/api";

export const metadata = { title: "Quests — StepWise" };
export const revalidate = 60;

const LANG_COLORS: Record<string, string> = {
  javascript: "#f59e0b",
  typescript: "#3b82f6",
  python: "#10b981",
  rust: "#ef4444",
  go: "#06b6d4",
};

export default async function ChallengesPage() {
  let challenges: ChallengeSummary[] = [];
  try { challenges = await fetchChallenges(); } catch { /* API offline */ }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px" }}>
      <div style={{ marginBottom: 48 }}>
        <div className="badge badge-indigo" style={{ marginBottom: 16 }}>
          {challenges.length} quest{challenges.length !== 1 ? "s" : ""} available
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.03em", color: "var(--color-text)", marginBottom: 12 }}>
          All Quests
        </h1>
        <p style={{ fontSize: 16, color: "var(--color-muted)" }}>
          Pick a quest, run the CLI, and start building.
        </p>
      </div>

      {challenges.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "var(--color-muted)" }}>No quests available yet. Make sure the API is running.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChallengeCard({ challenge: c }: { challenge: ChallengeSummary }) {
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
