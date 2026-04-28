import { fetchChallenges, type ChallengeSummary } from "@/lib/api";
import { ChallengeCard } from "@/components/challengeListing/ChallengeCard";

export const metadata = { title: "Quests — StepWise" };
export const revalidate = 60;



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

