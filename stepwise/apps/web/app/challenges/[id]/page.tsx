import { notFound } from "next/navigation";
import { fetchChallenge, type ChallengeDetail } from "@/lib/api";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const c = await fetchChallenge(id);
    return { title: `${c.title} — StepWise` };
  } catch {
    return { title: "Challenge — StepWise" };
  }
}

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let challenge: ChallengeDetail;

  try {
    challenge = await fetchChallenge(id);
  } catch {
    notFound();
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "100px 24px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <span className="badge badge-indigo">{challenge.language}</span>
          <span className="badge" style={{ background: "rgba(255,255,255,0.04)", color: "#666680", border: "1px solid rgba(255,255,255,0.07)" }}>
            {challenge.runtime}
          </span>
          <span className="badge" style={{ background: "rgba(255,255,255,0.04)", color: "#666680", border: "1px solid rgba(255,255,255,0.07)" }}>
            {challenge.steps.length} steps
          </span>
        </div>

        <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.03em", color: "#e8e8f0", marginBottom: 12 }}>
          {challenge.title}
        </h1>

        {challenge.description && (
          <p style={{ fontSize: 16, color: "#666680", lineHeight: 1.7 }}>{challenge.description}</p>
        )}
      </div>

      {/* Quick start */}
      <div className="glass" style={{ padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa", marginBottom: 16, textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.08em" }}>
          ⚡ Quick Start
        </h2>
        <div className="terminal">
          <div><span className="comment"># 1. Login (first time only)</span></div>
          <div style={{ marginBottom: 8 }}><span className="prompt">$ </span><span className="cmd">npx stepwise login</span></div>
          <div><span className="comment"># 2. Initialize the challenge workspace</span></div>
          <div style={{ marginBottom: 8 }}><span className="prompt">$ </span><span className="cmd">npx stepwise init {challenge.id}</span></div>
          <div><span className="comment"># 3. Open the first step folder, write your solution</span></div>
          <div style={{ marginBottom: 8 }}><span className="prompt">$ </span><span className="cmd">cd {challenge.id}/{challenge.steps[0]?.id ?? "step-1"}/</span></div>
          <div><span className="comment"># 4. Test your solution and advance automatically</span></div>
          <div><span className="prompt">$ </span><span className="cmd">npx stepwise test</span></div>
        </div>
      </div>

      {/* Steps */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e8e8f0", marginBottom: 24 }}>
          Steps
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {challenge.steps.map((step, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === challenge.steps.length - 1;

            return (
              <div key={step.id} style={{ display: "flex", gap: 20 }}>
                {/* Timeline */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28 }}>
                  <div className={`step-dot ${isFirst ? "step-dot-current" : "step-dot-locked"}`}>
                    {idx + 1}
                  </div>
                  {!isLast && (
                    <div style={{ width: 1, flexGrow: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ paddingBottom: isLast ? 0 : 32, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: step.prompt ? 12 : 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: isFirst ? "#e8e8f0" : "#555570" }}>
                      {step.title}
                    </h3>
                    {step.hasStarter && (
                      <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)", fontSize: 11 }}>
                        starter files
                      </span>
                    )}
                    {!isFirst && (
                      <span className="badge" style={{ background: "rgba(255,255,255,0.03)", color: "#333350", border: "1px solid rgba(255,255,255,0.05)", fontSize: 11 }}>
                        🔒 locked
                      </span>
                    )}
                  </div>

                  {step.prompt && isFirst && (
                    <div style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10, padding: "16px 20px", marginTop: 12,
                      fontSize: 14, color: "#888898", lineHeight: 1.7, fontFamily: "inherit",
                      whiteSpace: "pre-wrap",
                    }}>
                      {step.prompt}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
