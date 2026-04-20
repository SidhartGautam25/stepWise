"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchDashboard, type DashboardData } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session) {
      // @ts-ignore fastifyToken is injected in nextauth route
      const token = session.fastifyToken as string;
      if (!token) {
        router.push("/login");
        return;
      }

      fetchDashboard(token)
        .then(setData)
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
        .finally(() => setLoading(false));
    }
  }, [router, session, status]);

  if (loading || status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(108,99,255,0.3)", borderTopColor: "#6c63ff", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) }}`}</style>
          <p style={{ color: "#666680" }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: "#ef4444", marginBottom: 16 }}>{error}</p>
          <Link href="/login" className="btn btn-primary">Sign in again</Link>
        </div>
      </div>
    );
  }

  const totalCompleted = data?.progress.reduce((acc, p) => acc + p.completedCount, 0) ?? 0;
  const completedChallenges = data?.progress.filter((p) => p.challengeCompleted).length ?? 0;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 24px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 14, color: "#666680", marginBottom: 8 }}>
          Welcome back,
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", color: "#e8e8f0", marginBottom: 4 }}>
          {session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Student"}
        </h1>
        <p style={{ fontSize: 14, color: "#444460" }}>{session?.user?.email}</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 48 }}>
        {[
          { label: "Challenges started", value: data?.progress.length ?? 0, color: "#6c63ff" },
          { label: "Steps completed", value: totalCompleted, color: "#10b981" },
          { label: "Challenges finished", value: completedChallenges, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ padding: "24px 28px" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color, marginBottom: 4, letterSpacing: "-0.03em" }}>
              {value}
            </div>
            <div style={{ fontSize: 13, color: "#666680" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress section */}
      {data?.progress.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e8e8f0", marginBottom: 12 }}>
            Ready to start?
          </h2>
          <p style={{ fontSize: 15, color: "#666680", marginBottom: 24 }}>
            You haven&apos;t started any challenges yet.
          </p>
          <Link href="/challenges" className="btn btn-primary">Browse challenges →</Link>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e8e8f0", marginBottom: 24 }}>
            Your Progress
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {data?.progress.map((p) => {
              const pct = p.totalSteps > 0 ? Math.round((p.completedCount / p.totalSteps) * 100) : 0;

              return (
                <div key={p.challengeId} className="glass" style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#e8e8f0" }}>
                          {p.challengeTitle}
                        </h3>
                        {p.challengeCompleted && (
                          <span className="badge badge-emerald">✓ completed</span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: "#666680" }}>
                        Current step: <span style={{ color: "#a78bfa", fontFamily: "var(--font-mono)" }}>{p.currentStepKey}</span>
                      </p>
                    </div>
                    <Link href={`/challenges/${p.challengeId}`} className="btn btn-ghost" style={{ fontSize: 13, padding: "6px 14px" }}>
                      View →
                    </Link>
                  </div>

                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="progress-track" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span style={{ fontSize: 13, color: "#666680", minWidth: 60, textAlign: "right" }}>
                      {p.completedCount}/{p.totalSteps} steps
                    </span>
                  </div>

                  {/* Completed step keys */}
                  {p.completedStepKeys.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
                      {p.completedStepKeys.map((key) => (
                        <span key={key} className="badge badge-emerald" style={{ fontSize: 11 }}>
                          ✓ {key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
