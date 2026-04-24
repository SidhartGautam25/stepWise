import Link from "next/link";
import { fetchChallenges } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { COURSES } from "@/lib/courses";
import { SectionLabel } from "@/components/home/SectionLabel";
import { FeatureCard } from "@/components/home/FeatureCard";
import { CourseCard } from "@/components/home/CourseCard";
import { StepCard } from "@/components/home/StepCard";
import { PhilosophyQuote } from "@/components/home/PhilosophyQuote";
import { CTABanner } from "@/components/home/CTABanner";
import { StatBadge } from "@/components/home/StatBadge";
import { HeroAnimation } from "@/components/home/HeroAnimation";

export const revalidate = 60;

/* ─── Data ──────────────────────────────────────── */
const DIFFERENTIATORS = [
  { icon: "🖥️", label: "Your real local machine" },
  { icon: "⚡", label: "CLI-native workflow" },
  { icon: "🔓", label: "Auto-advance on success" },
  { icon: "🧩", label: "Step-locked progression" },
  { icon: "🧪", label: "Real test runners" },
  { icon: "📦", label: "Zero browser sandbox" },
];

const APPROACH_FEATURES = [
  {
    icon: "🧭",
    title: "We Guide, You Discover",
    description:
      "StepWise doesn't hand you answers — it frames the right questions. Every quest is designed to build genuine intuition, not surface-level pattern matching. You discover the 'why' alongside the 'how'.",
    accent: "indigo" as const,
    highlight: "Intuition over memorization",
  },
  {
    icon: "🏠",
    title: "Your Real Environment",
    description:
      "No browser playgrounds. No constrained online editors. You work in your actual terminal, your actual file system — the same environment you'll use professionally, from day one.",
    accent: "emerald" as const,
    highlight: "Real tools from the start",
  },
  {
    icon: "🪜",
    title: "Structured Increments",
    description:
      "Each quest is a carefully sequenced series of steps. Concepts unlock progressively — you can't skip ahead until each foundation is solid. This mirrors how expertise actually forms.",
    accent: "amber" as const,
    highlight: "Scaffolded for long-term retention",
  },
  {
    icon: "🔄",
    title: "Instant Feedback Loop",
    description:
      "Run tests locally. Results sync automatically. Know immediately whether your solution holds up — no waiting, no submitting to a queue, no guessing if your approach was right.",
    accent: "cyan" as const,
    highlight: "Seconds, not minutes, between attempts",
  },
  {
    icon: "🗺️",
    title: "Clear Progress Paths",
    description:
      "Every track has a visible map — you always know where you are, what you've unlocked, and what waits ahead. Motivation comes from seeing how far you've come.",
    accent: "rose" as const,
    highlight: "Momentum is visible",
  },
  {
    icon: "🧬",
    title: "Built Like Real Projects",
    description:
      "StepWise quests mirror real-world project structures — files, modules, configs. You're not solving isolated puzzles; you're building things that look and feel like actual software.",
    accent: "indigo" as const,
    highlight: "Portfolio-ready instincts",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    icon: "⚡",
    title: "Install the CLI",
    description:
      "One command. No account required to start exploring. The StepWise CLI sets up everything you need in seconds.",
    terminalLines: [
      { type: "prompt" as const, text: "npx stepwise@latest --help" },
      { type: "success" as const, text: "✓ StepWise CLI ready" },
      { type: "output" as const, text: "  Commands: init, test, status, list" },
    ],
  },
  {
    step: "2",
    icon: "📦",
    title: "Pick a Quest & Init",
    description:
      "Choose a track and initialize your workspace. Starter files, instructions, and tests are all set up automatically.",
    terminalLines: [
      { type: "prompt" as const, text: "stepwise init typescript-mastery" },
      { type: "success" as const, text: "✓ Workspace created" },
      { type: "output" as const, text: "  step-01-types/ (starter files ready)" },
    ],
  },
  {
    step: "3",
    icon: "🧪",
    title: "Explore, Build & Test",
    description:
      "Open your files, explore the challenge, and build a solution. Run tests locally — results sync to your dashboard automatically.",
    terminalLines: [
      { type: "prompt" as const, text: "stepwise test" },
      { type: "success" as const, text: "✓ 3/4 tests passing" },
      { type: "output" as const, text: "  ✗ type-narrowing — see hint?" },
    ],
  },
  {
    step: "4",
    icon: "🚀",
    title: "Advance Automatically",
    description:
      "Pass all checks and the next step unlocks instantly. Your progress is tracked, your path is clear, and the next challenge is ready.",
    terminalLines: [
      { type: "prompt" as const, text: "stepwise test" },
      { type: "success" as const, text: "✓ All 4 tests passing!" },
      { type: "success" as const, text: "→ Unlocked: step-02-interfaces" },
    ],
    isLast: true,
  },
];

/* ─── Page ──────────────────────────────────────── */
export default async function HomePage() {
  let challenges: Awaited<ReturnType<typeof fetchChallenges>> = [];
  try {
    challenges = await fetchChallenges();
  } catch {
    /* API offline — render static sections */
  }

  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          paddingTop: 140,
          paddingBottom: 120,
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Hero gradient backdrop */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--gradient-hero)",
            pointerEvents: "none",
          }}
        />

        {/* Floating code-fragment animation */}
        <HeroAnimation />

        {/* Glow orbs */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "30%",
            left: "15%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "var(--color-indigo-muted)",
            filter: "blur(80px)",
            pointerEvents: "none",
            animation: "pulse-glow 6s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "40%",
            right: "10%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "var(--color-emerald-muted)",
            filter: "blur(80px)",
            pointerEvents: "none",
            animation: "pulse-glow 8s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />

        <div
          className="container"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div
            className="section-eyebrow animate-fade-in"
            style={{ margin: "0 auto 28px", width: "fit-content" }}
          >
            ✦ Structured guided exploration — not a tutorial site
          </div>

          <h1
            className="animate-fade-in delay-1"
            style={{
              fontSize: "var(--text-hero)",
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: "-0.045em",
              marginBottom: 28,
              color: "var(--color-text)",
            }}
          >
            Discover by{" "}
            <span className="gradient-text">Doing.</span>
            <br />
            <span style={{ color: "var(--color-text-2)" }}>Not by Watching.</span>
          </h1>

          <p
            className="animate-fade-in delay-2"
            style={{
              fontSize: "var(--text-md)",
              color: "var(--color-muted)",
              maxWidth: 600,
              margin: "0 auto 48px",
              lineHeight: 1.75,
            }}
          >
            StepWise is a quest-based exploration platform. We guide you through
            real projects — step by step — in your actual local environment.
            No sandboxes. No hand-holding. Just structured discovery.
          </p>

          <div
            className="animate-fade-in delay-3"
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 64,
            }}
          >
            <Link
              href="/challenges"
              className="btn btn-primary"
              style={{ fontSize: "var(--text-base)", padding: "14px 32px" }}
            >
              {isLoggedIn ? "Continue Exploring →" : "Explore Quests →"}
            </Link>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn btn-ghost"
                style={{ fontSize: "var(--text-base)", padding: "14px 28px" }}
              >
                My Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="btn btn-ghost"
                style={{ fontSize: "var(--text-base)", padding: "14px 28px" }}
              >
                Create Free Account
              </Link>
            )}
          </div>

          {/* Hero stats */}
          <div
            className="animate-fade-in delay-4"
            style={{
              display: "flex",
              gap: 32,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "6+", label: "Tracks" },
              { value: "50+", label: "Guided Quests" },
              { value: "100%", label: "Local Environment" },
              { value: "0", label: "Browser Sandboxes" },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "var(--text-2xl)",
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    color: "var(--color-text)",
                  }}
                  className="gradient-text-indigo"
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-muted)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DIFFERENTIATORS STRIP
          ══════════════════════════════════════════ */}
      <div style={{ padding: "0 0 72px" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {DIFFERENTIATORS.map(({ icon, label }) => (
              <div
                key={label}
                className="glass"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-2)",
                  fontWeight: 500,
                  transition: "all var(--transition-base)",
                }}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="divider-gradient" />

      {/* ══════════════════════════════════════════
          OUR APPROACH
          ══════════════════════════════════════════ */}
      <section className="section container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionLabel icon="🧭">Our Approach</SectionLabel>
          <h2 className="section-heading" style={{ marginBottom: 16 }}>
            A different kind of{" "}
            <span className="gradient-text">guidance</span>
          </h2>
          <p
            className="section-subheading"
            style={{ margin: "0 auto" }}
          >
            StepWise isn't about memorizing syntax. It's about building the instincts
            that make you genuinely capable — one carefully crafted step at a time.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {APPROACH_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <hr className="divider-gradient" />

      {/* ══════════════════════════════════════════
          PHILOSOPHY QUOTE
          ══════════════════════════════════════════ */}
      <section className="section-sm container">
        <PhilosophyQuote
          quote="We don't teach you to code. We build the environment where you discover you already can."
          attribution="The StepWise Philosophy"
        />
      </section>

      <hr className="divider-gradient" />

      {/* ══════════════════════════════════════════
          TRACKS / COURSES
          ══════════════════════════════════════════ */}
      <section className="section container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 48,
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <SectionLabel icon="📚">Explore Tracks</SectionLabel>
            <h2 className="section-heading">
              Choose your{" "}
              <span className="gradient-text">exploration path</span>
            </h2>
          </div>
          <p
            className="section-subheading"
            style={{ maxWidth: 380, marginBottom: 0 }}
          >
            Every track is a structured sequence of quests, each building on the last.
            Pick the language or tool you want to master.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <hr className="divider-gradient" />

      {/* ══════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════ */}
      <section className="section container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionLabel icon="⚙️">The Workflow</SectionLabel>
          <h2 className="section-heading" style={{ marginBottom: 16 }}>
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="section-subheading" style={{ margin: "0 auto" }}>
            From installing the CLI to advancing through steps — the whole loop
            runs in your terminal. Fast, local, and fully in your control.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {HOW_IT_WORKS_STEPS.map((step) => (
            <StepCard key={step.step} {...step} />
          ))}
        </div>
      </section>

      <hr className="divider-gradient" />

      {/* ══════════════════════════════════════════
          LIVE QUESTS PREVIEW (from API)
          ══════════════════════════════════════════ */}
      {challenges.length > 0 && (
        <section className="section container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 40,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <SectionLabel icon="🎯">Live Quests</SectionLabel>
              <h2 className="section-heading">
                Start a{" "}
                <span className="gradient-text">quest today</span>
              </h2>
            </div>
            <Link
              href="/challenges"
              className="btn btn-ghost"
              style={{ fontSize: "var(--text-sm)", padding: "9px 20px" }}
            >
              View all quests →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {challenges.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/challenges/${c.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="glass card-hover"
                  style={{ padding: 28, height: "100%" }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <StatBadge variant="indigo">{c.language}</StatBadge>
                    <StatBadge variant="ghost">{c.stepCount} steps</StatBadge>
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--text-md)",
                      fontWeight: 700,
                      color: "var(--color-text)",
                      marginBottom: 8,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {c.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-muted)",
                    }}
                  >
                    v{c.version} · {c.runtime}
                  </p>

                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: "1px solid var(--color-border)",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-xs)",
                        fontWeight: 700,
                        color: "var(--color-indigo)",
                      }}
                    >
                      Start quest →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <hr className="divider-gradient" />

      {/* ══════════════════════════════════════════
          CTA BANNER
          ══════════════════════════════════════════ */}
      <section className="section container">
        <CTABanner isLoggedIn={isLoggedIn} />
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "48px 0",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 40,
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "var(--gradient-indigo)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 900,
                  color: "var(--color-white)",
                }}
              >
                S
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "var(--text-md)",
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                }}
              >
                Step<span style={{ color: "var(--color-indigo)" }}>Wise</span>
              </span>
            </div>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-muted)",
                lineHeight: 1.65,
                maxWidth: 220,
              }}
            >
              Guided exploration for the next generation of developers.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              Explore
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                { href: "/challenges", label: "All Quests" },
                { href: "/challenges?language=JavaScript", label: "JavaScript" },
                { href: "/challenges?language=TypeScript", label: "TypeScript" },
                { href: "/challenges?language=Node.js", label: "Node.js" },
              ].map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="footer-link"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              Account
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { href: "/login", label: "Sign In" },
                { href: "/register", label: "Create Account" },
                { href: "/dashboard", label: "Dashboard" },
              ].map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="footer-link"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* CLI Quick Start */}
          <div>
            <h4
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              Quick Start
            </h4>
            <div className="terminal" style={{ fontSize: "var(--text-xs)" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="prompt">$</span>
                <span className="cmd">npx stepwise init</span>
              </div>
            </div>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-muted)",
                marginTop: 10,
                lineHeight: 1.6,
              }}
            >
              No account required to start.
            </p>
          </div>
        </div>

        <div
          className="container"
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
            © {new Date().getFullYear()} StepWise. Guided exploration for developers.
          </p>
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-muted)",
            }}
          >
            Built with ♥ by the StepWise team
          </p>
        </div>
      </footer>
    </div>
  );
}
