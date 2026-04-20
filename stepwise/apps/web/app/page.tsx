import Link from "next/link";
import { fetchChallenges } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const revalidate = 60; // ISR — refresh every minute

export default async function HomePage() {
  let challenges: Awaited<ReturnType<typeof fetchChallenges>> = [];
  try { challenges = await fetchChallenges(); } catch { /* API offline */ }

  const session = await getServerSession(authOptions);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        paddingTop: 180, paddingBottom: 100,
        textAlign: "center", position: "relative", overflow: "hidden",
        maxWidth: 900, margin: "0 auto", padding: "180px 24px 100px",
      }}>
        {/* Glow orbs */}
        <div style={{
          position: "fixed", top: "20%", left: "50%", transform: "translate(-50%, -50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="badge badge-indigo" style={{ margin: "0 auto 24px", width: "fit-content" }}>
            ✦ Zero setup required
          </div>

          <h1 style={{
            fontSize: "clamp(48px, 7vw, 84px)", fontWeight: 900,
            lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 24,
            color: "#e8e8f0",
          }}>
            Learn by{" "}
            <span className="gradient-text">Building.</span>
            <br />Not by Watching.
          </h1>

          <p style={{
            fontSize: 18, color: "#666680", maxWidth: 560, margin: "0 auto 48px",
            lineHeight: 1.7,
          }}>
            StepWise is a code challenge platform where you build real projects step by step,
            run tests locally, and get immediate feedback — no browser sandbox, no toy problems.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/challenges" className="btn btn-primary" style={{ fontSize: 15, padding: "12px 28px" }}>
              {session ? "Continue Learning →" : "Browse Challenges →"}
            </Link>
            {session ? (
              <Link href="/dashboard" className="btn btn-ghost" style={{ fontSize: 15, padding: "12px 28px" }}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn btn-ghost" style={{ fontSize: 15, padding: "12px 28px" }}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 48, color: "#e8e8f0" }}>
          How it works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            {
              step: "1", icon: "⚡", title: "Install the CLI",
              desc: "One command. No accounts required to start.",
              code: "npx stepwise --help",
            },
            {
              step: "2", icon: "📦", title: "Init a challenge",
              desc: "Workspace created with starter files and instructions.",
              code: "stepwise init promise-basic",
            },
            {
              step: "3", icon: "🧪", title: "Write code & test",
              desc: "Run tests locally. Results go to the server automatically.",
              code: "stepwise test",
            },
            {
              step: "4", icon: "🚀", title: "Advance automatically",
              desc: "Pass all checks and the next step is unlocked instantly.",
              code: "→ Next step ready: sum-two",
            },
          ].map(({ step, icon, title, desc, code }) => (
            <div key={step} className="glass" style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(108, 99, 255, 0.15)",
                  border: "1px solid rgba(108, 99, 255, 0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>{icon}</div>
                <span style={{ fontSize: 12, color: "#6c63ff", fontWeight: 600 }}>STEP {step}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#e8e8f0" }}>{title}</h3>
              <p style={{ fontSize: 14, color: "#666680", marginBottom: 16, lineHeight: 1.6 }}>{desc}</p>
              <div className="terminal" style={{ padding: "10px 14px", fontSize: 12 }}>
                <span className="prompt">$ </span>
                <span className="cmd">{code}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Challenge preview */}
      {challenges.length > 0 && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 120px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#e8e8f0" }}>Challenges</h2>
            <Link href="/challenges" style={{ fontSize: 14, color: "#6c63ff", textDecoration: "none" }}>
              View all →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {challenges.slice(0, 3).map((c) => (
              <Link key={c.id} href={`/challenges/${c.id}`} style={{ textDecoration: "none" }}>
                <div className="glass card-hover" style={{ padding: 28 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    <span className="badge badge-indigo">{c.language}</span>
                    <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "#666680", border: "1px solid rgba(255,255,255,0.07)" }}>
                      {c.stepCount} steps
                    </span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#e8e8f0", marginBottom: 8 }}>{c.title}</h3>
                  <p style={{ fontSize: 13, color: "#666680" }}>v{c.version}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "40px 24px",
        textAlign: "center",
        color: "#333350", fontSize: 13,
      }}>
        Built with ♥ · StepWise {new Date().getFullYear()}
      </footer>
    </div>
  );
}
