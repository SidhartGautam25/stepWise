"use client";

/**
 * InteractiveLessonSequence
 *
 * Renders an animated, slide-based interactive lesson.
 * Slide *content* (headings, body, bullets) comes from the server via the API.
 * Slide *illustration data* (items, labels, etc.) comes from @repo/lesson-content — the single source of truth.
 * React illustration *components* live below, consuming that data.
 */

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import type { InteractiveLesson } from "@/lib/api";

// ── Illustration data — single source of truth in @repo/lesson-content ────────
import {
  WELCOME_HELLO_ITEMS,
  WELCOME_EVERYDAY_ACTIVITIES,
  WELCOME_MANAGER_ACTORS,
  WELCOME_MANAGER_STEPS,
  STORAGE_JOURNEY_STEPS,
  HOME_FOLDER_TREE,
  type FolderTree,
} from "@repo/lesson-content";

interface InteractiveLessonSequenceProps {
  lesson: InteractiveLesson;
  stepId: string;
  onCompleted?: (stepId: string) => void;
}

export function InteractiveLessonSequence({
  lesson,
  stepId,
  onCompleted,
}: InteractiveLessonSequenceProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = lesson.slides;
  const activeSlide = slides[slideIndex];
  const isLastSlide = slideIndex === slides.length - 1;

  useEffect(() => {
    setSlideIndex(0);
  }, [stepId]);

  const progressLabel = useMemo(
    () => `${slideIndex + 1} / ${slides.length}`,
    [slideIndex, slides.length],
  );

  if (!activeSlide) return null;

  return (
    <div style={outerShell}>
      <style>{`
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.25)} 50%{box-shadow:0 0 0 8px rgba(34,197,94,0)} }
        @keyframes slide-in   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop-in     { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
        @keyframes flow-right { 0%{transform:translateX(-60%);opacity:0} 100%{transform:translateX(0);opacity:1} }
        @keyframes bounce-in  { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>

      {/* ── Header ── */}
      <div style={header}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Interactive Lesson
          </div>
          <div style={{ fontSize: 11, color: "var(--interactive-muted)", marginTop: 2 }}>
            Explore the idea, then try it.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {slides.map((s, i) => (
              <div key={s.id} style={{ width: 7, height: 7, borderRadius: "50%", transition: "background 0.3s", background: i === slideIndex ? "var(--color-emerald)" : i < slideIndex ? "rgba(34,197,94,0.4)" : "var(--interactive-dot)" }} />
            ))}
          </div>
          <div style={{ padding: "4px 9px", borderRadius: 999, background: "var(--interactive-pill-bg)", color: "var(--interactive-pill-text)", fontSize: 11, fontWeight: 700, border: "1px solid var(--interactive-pill-border)" }}>
            {progressLabel}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 22px 16px" }}>
        <div key={activeSlide.id} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 860, margin: "0 auto", animation: "slide-in 0.35s ease" }}>
          <h2 style={{ fontSize: 21, lineHeight: 1.25, fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.02em", margin: 0, wordBreak: "break-word" }}>
            {activeSlide.heading}
          </h2>

          <SceneIllustration slideId={activeSlide.id} />

          <div style={{ display: "flex", flexDirection: "column", gap: 9, color: "var(--interactive-body)", fontSize: 13.5, lineHeight: 1.8 }}>
            {activeSlide.body.split("\n\n").map((p, i) => (
              <p key={i} style={{ margin: 0, wordBreak: "break-word" }}>{p}</p>
            ))}
          </div>

          {activeSlide.bullets && activeSlide.bullets.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activeSlide.bullets.map((bullet) => (
                <div key={bullet} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 12px", borderRadius: 9, background: "var(--interactive-card-bg)", border: "1px solid var(--interactive-card-border)", fontSize: 13, lineHeight: 1.5, fontWeight: 500, color: "var(--color-text)", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                  {bullet}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={footer}>
        <button onClick={() => setSlideIndex(i => Math.max(0, i - 1))} disabled={slideIndex === 0}
          style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--interactive-card-border)", background: "var(--interactive-card-bg)", color: slideIndex === 0 ? "var(--interactive-muted)" : "var(--color-text)", cursor: slideIndex === 0 ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13 }}>
          ← Back
        </button>
        <button
          onClick={() => { if (isLastSlide) { onCompleted?.(stepId); return; } setSlideIndex(i => Math.min(slides.length - 1, i + 1)); }}
          style={{ padding: "9px 22px", borderRadius: 8, border: "1px solid rgba(34,197,94,0.35)", background: isLastSlide ? "rgba(34,197,94,0.18)" : "rgba(34,197,94,0.08)", color: "var(--color-emerald)", cursor: "pointer", fontWeight: 800, fontSize: 13, transition: "background 0.2s", animation: isLastSlide ? "pulse-glow 2s infinite" : "none" }}>
          {isLastSlide ? "✓ Got it →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// ─── Illustration router ──────────────────────────────────────────────────────

function SceneIllustration({ slideId }: { slideId: string }) {
  if (slideId === "welcome-hello")       return <WelcomeHello />;
  if (slideId === "welcome-everyday")    return <WelcomeEveryday />;
  if (slideId === "welcome-manager")     return <WelcomeManager />;
  if (slideId === "welcome-linux")       return <WelcomeLinux />;
  if (slideId === "storage-your-stuff")  return <StorageYourStuff />;
  if (slideId === "storage-vs-memory")   return <StorageVsMemory />;
  if (slideId === "storage-folders")     return <StorageFolders />;
  if (slideId === "storage-your-home")   return <StorageYourHome />;
  if (slideId === "files-and-directories") return <LegacyFilesAndDirs />;
  if (slideId === "hardware-parts")        return <LegacyHardwareParts />;
  return <DefaultIllustration />;
}

// ─── Welcome Step Components ──────────────────────────────────────────────────
// All data comes from @repo/lesson-content / illustrations.ts

function WelcomeHello() {
  const [lit, setLit] = useState<string | null>(null);
  return (
    <div style={card}>
      <div style={cardHint}>Tap a card to learn more</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {WELCOME_HELLO_ITEMS.map(({ id, icon, label, reveal }) => {
          const active = lit === id;
          return (
            <div key={id} onClick={() => setLit(active ? null : id)}
              style={{ cursor: "pointer", padding: "14px 16px", borderRadius: 12, border: active ? "2px solid rgba(34,197,94,0.5)" : "1px solid var(--interactive-card-border)", background: active ? "rgba(34,197,94,0.08)" : "var(--interactive-card-bg)", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26, animation: active ? "float 2s ease infinite" : "none" }}>{icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>{label}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--interactive-muted)" }}>{active ? "▲" : "▼"}</span>
              </div>
              {active && <div style={{ fontSize: 13, color: "var(--interactive-body)", lineHeight: 1.6, animation: "slide-in 0.2s ease", paddingLeft: 4 }}>{reveal}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WelcomeEveryday() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={card}>
      <div style={cardHint}>Tap something you do every day — see what the OS does for it</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        {WELCOME_EVERYDAY_ACTIVITIES.map(({ id, icon, label, os }) => {
          const active = selected === id;
          return (
            <div key={id} onClick={() => setSelected(active ? null : id)}
              style={{ cursor: "pointer", padding: "12px", borderRadius: 11, border: active ? "2px solid rgba(34,197,94,0.5)" : "1px solid var(--interactive-card-border)", background: active ? "rgba(34,197,94,0.07)" : "var(--interactive-card-bg)", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 26, textAlign: "center" }}>{icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text)", textAlign: "center", lineHeight: 1.4 }}>{label}</div>
              {active && (
                <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 11, color: "var(--color-text)", lineHeight: 1.5, animation: "slide-in 0.2s ease" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--color-emerald)", textTransform: "uppercase", marginBottom: 3 }}>What the OS did →</div>
                  {os}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WelcomeManager() {
  const [step, setStep] = useState(0);
  const simSteps = WELCOME_MANAGER_STEPS;
  const actors = WELCOME_MANAGER_ACTORS;
  const isRunning = step > 0 && step <= simSteps.length;
  const isDone = step > simSteps.length;
  return (
    <div style={card}>
      <div style={cardHint}>Simulate a restaurant — click Send Order</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
        {actors.map(({ icon, label, sublabel, color, border, isManager }) => (
          <div key={label} style={{ padding: 12, borderRadius: 10, background: color, border: `${isManager && isRunning ? 2 : 1}px solid ${border}`, textAlign: "center", display: "flex", flexDirection: "column", gap: 4, transition: "all 0.3s", boxShadow: (isManager && isRunning) ? `0 0 12px ${border}` : "none" }}>
            <div style={{ fontSize: 28 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)" }}>{label}</div>
            <div style={{ fontSize: 10, color: "var(--interactive-muted)" }}>{sublabel}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 80 }}>
        {simSteps.slice(0, step).map((s, i) => (
          <div key={i} style={{ padding: "8px 12px", borderRadius: 9, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 12, color: "var(--color-text)", animation: "flow-right 0.4s ease", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700 }}>{s.from}</span>
            <span style={{ color: "var(--interactive-muted)" }}>→</span>
            <span style={{ fontWeight: 700 }}>{s.to}</span>
            <span style={{ color: "var(--interactive-muted)", fontSize: 11 }}>{s.action}</span>
          </div>
        ))}
        {isDone && <div style={{ padding: "8px 12px", borderRadius: 9, background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)", fontSize: 12, fontWeight: 700, color: "var(--color-emerald)", textAlign: "center", animation: "bounce-in 0.4s ease" }}>✅ Order complete! The OS kept everything smooth.</div>}
      </div>
      <button onClick={() => setStep(s => s > simSteps.length ? 0 : s + 1)}
        style={{ marginTop: 6, padding: "9px 16px", borderRadius: 9, border: "none", background: isDone ? "rgba(100,116,139,0.15)" : "rgba(34,197,94,0.15)", color: isDone ? "var(--interactive-muted)" : "var(--color-emerald)", cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" }}>
        {isDone ? "↺ Try again" : step === 0 ? "▶ Send Order" : "→ Next step"}
      </button>
    </div>
  );
}

function WelcomeLinux() {
  const [linuxOpen, setLinuxOpen] = useState(false);
  const [macTried, setMacTried] = useState(false);
  return (
    <div style={card}>
      <div style={cardHint}>Click each box to explore</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div onClick={() => setMacTried(true)} style={{ cursor: "pointer", padding: 16, borderRadius: 12, border: macTried ? "2px solid rgba(239,68,68,0.4)" : "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", display: "flex", flexDirection: "column", gap: 8, transition: "all 0.3s" }}>
          <div style={{ fontSize: 36, textAlign: "center" }}>🔒</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)", textAlign: "center" }}>Windows / Mac</div>
          {!macTried && <div style={{ fontSize: 11, color: "var(--interactive-muted)", textAlign: "center" }}>Click to look inside →</div>}
          {macTried && <div style={{ fontSize: 12, color: "rgba(239,68,68,0.8)", textAlign: "center", animation: "pop-in 0.3s ease", fontWeight: 600, padding: "8px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>🚫 Access denied. This is a closed box — no peeking allowed.</div>}
        </div>
        <div onClick={() => setLinuxOpen(true)} style={{ cursor: "pointer", padding: 16, borderRadius: 12, border: linuxOpen ? "2px solid rgba(34,197,94,0.5)" : "1px solid rgba(34,197,94,0.3)", background: linuxOpen ? "rgba(34,197,94,0.10)" : "rgba(34,197,94,0.04)", display: "flex", flexDirection: "column", gap: 8, transition: "all 0.3s", boxShadow: linuxOpen ? "0 0 16px rgba(34,197,94,0.2)" : "none" }}>
          <div style={{ fontSize: 36, textAlign: "center", transition: "all 0.4s", transform: linuxOpen ? "rotate(15deg)" : "none" }}>{linuxOpen ? "🪟" : "📦"}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)", textAlign: "center" }}>Linux</div>
          {!linuxOpen && <div style={{ fontSize: 11, color: "var(--interactive-muted)", textAlign: "center" }}>Click to open →</div>}
          {linuxOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, animation: "slide-in 0.3s ease" }}>
              {["🔍 See how it works", "✏️ Change anything", "📚 Learn deeply", "🚀 Used everywhere"].map(t => (
                <div key={t} style={{ fontSize: 11, padding: "5px 8px", borderRadius: 6, background: "rgba(34,197,94,0.1)", color: "var(--color-text)", fontWeight: 600 }}>{t}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      {linuxOpen && <div style={{ marginTop: 4, padding: "9px 12px", borderRadius: 9, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", fontSize: 12, fontWeight: 600, color: "var(--color-emerald)", textAlign: "center" }}>🎉 That's why we're using Linux — everything is visible and learnable!</div>}
    </div>
  );
}

// ─── Storage Step Components ──────────────────────────────────────────────────

function StorageYourStuff() {
  const [step, setStep] = useState(0);
  const journey = STORAGE_JOURNEY_STEPS;
  return (
    <div style={card}>
      <div style={cardHint}>Walk through what actually happens — click to go step by step</div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <div style={{ fontSize: 28 }}>💾</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--interactive-muted)", textAlign: "center" }}>Storage</div>
        </div>
        <div style={{ paddingRight: 60, display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
          {journey.map(({ icon, action, result, color, border }, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <div key={action} style={{ padding: "10px 12px", borderRadius: 10, background: done || current ? color : "var(--interactive-card-bg)", border: `${current ? 2 : 1}px solid ${done || current ? border : "var(--interactive-card-border)"}`, transition: "all 0.3s", opacity: i > step ? 0.4 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22, animation: current ? "float 1.5s ease infinite" : "none" }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)" }}>{action}</div>
                    {(done || current) && <div style={{ fontSize: 11, color: "var(--interactive-body)", marginTop: 2, animation: "slide-in 0.3s ease" }}>{result}</div>}
                  </div>
                  {done && <span style={{ fontSize: 16 }}>✅</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={() => setStep(s => s < journey.length ? s + 1 : 0)}
        style={{ padding: "9px 16px", borderRadius: 9, border: "none", background: step >= journey.length ? "rgba(100,116,139,0.15)" : "rgba(34,197,94,0.15)", color: step >= journey.length ? "var(--interactive-muted)" : "var(--color-emerald)", cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" }}>
        {step === 0 ? "▶ Start the journey" : step >= journey.length ? "↺ Replay" : "→ Next"}
      </button>
    </div>
  );
}

function StorageVsMemory() {
  const [onDesk, setOnDesk] = useState<string[]>([]);
  const books = ["📖 Photo Album", "📝 School Notes", "🎵 Music Files", "📋 Documents"];
  const moveToDesk = (book: string) => setOnDesk(d => d.includes(book) ? d : [...d, book]);
  const returnToShelf = (book: string) => setOnDesk(d => d.filter(b => b !== book));
  return (
    <div style={card}>
      <div style={cardHint}>Click books to move them between shelf and desk</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: 12, borderRadius: 12, border: "2px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.05)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--color-emerald)", textTransform: "uppercase", letterSpacing: "0.06em" }}>📚 Bookshelf = Storage</div>
          <div style={{ fontSize: 10, color: "var(--interactive-muted)" }}>Permanent. Always there.</div>
          {books.filter(b => !onDesk.includes(b)).map(book => (
            <div key={book} onClick={() => moveToDesk(book)} style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)", fontSize: 12, fontWeight: 600, color: "var(--color-text)", cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{book}</span><span style={{ fontSize: 10, color: "var(--interactive-muted)" }}>use →</span>
            </div>
          ))}
          {books.filter(b => !onDesk.includes(b)).length === 0 && <div style={{ fontSize: 11, color: "var(--interactive-muted)", textAlign: "center", fontStyle: "italic" }}>Shelf empty...</div>}
        </div>
        <div style={{ padding: 12, borderRadius: 12, border: `${onDesk.length ? 2 : 1}px solid ${onDesk.length ? "rgba(245,158,11,0.4)" : "rgba(100,116,139,0.25)"}`, background: onDesk.length ? "rgba(245,158,11,0.05)" : "rgba(100,116,139,0.04)", display: "flex", flexDirection: "column", gap: 8, transition: "all 0.3s" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(245,158,11,0.8)", textTransform: "uppercase", letterSpacing: "0.06em" }}>🖥️ Desk = Workspace</div>
          <div style={{ fontSize: 10, color: "var(--interactive-muted)" }}>What you're using now.</div>
          {onDesk.map(book => (
            <div key={book} onClick={() => returnToShelf(book)} style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", fontSize: 12, fontWeight: 600, color: "var(--color-text)", cursor: "pointer", transition: "all 0.2s", animation: "pop-in 0.25s ease", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{book}</span><span style={{ fontSize: 10, color: "var(--interactive-muted)" }}>← put back</span>
            </div>
          ))}
          {onDesk.length === 0 && <div style={{ fontSize: 11, color: "var(--interactive-muted)", textAlign: "center", padding: "10px 0", fontStyle: "italic" }}>Desk is empty — grab a book!</div>}
        </div>
      </div>
      {onDesk.length > 0 && <div style={{ padding: "8px 12px", borderRadius: 9, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", fontSize: 11, color: "var(--interactive-body)", textAlign: "center" }}>💡 Books on the desk would disappear if the power went out. Books on the shelf stay forever.</div>}
    </div>
  );
}

function StorageFolders() {
  const [open, setOpen] = useState<Record<string, boolean>>({ "Photos": false, "Music": false });
  const toggle = (name: string) => setOpen(o => ({ ...o, [name]: !o[name] }));
  const files: Record<string, string[]> = { Photos: ["📄 holiday-2024.jpg", "📄 birthday.jpg", "📄 selfie.png"], Music: ["🎵 favorites.mp3", "🎵 workout.mp3"] };
  return (
    <div style={card}>
      <div style={cardHint}>Click the folders to expand them</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={dirRowStyle}><span>📁</span><span>All My Files</span></div>
        <div style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 5 }}>
          {["Photos", "Music"].map(folder => (
            <div key={folder}>
              <div onClick={() => toggle(folder)} style={{ cursor: "pointer", padding: "9px 12px", borderRadius: 8, background: open[folder] ? "rgba(99,102,241,0.12)" : "rgba(6,182,212,0.08)", border: `${open[folder] ? 2 : 1}px solid ${open[folder] ? "rgba(99,102,241,0.35)" : "rgba(6,182,212,0.2)"}`, fontSize: 13, fontWeight: 600, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
                <span>{open[folder] ? "📂" : "📁"}</span><span>{folder}</span><span style={{ marginLeft: "auto", fontSize: 11, color: "var(--interactive-muted)" }}>{open[folder] ? "▲" : "▼"}</span>
              </div>
              {open[folder] && (
                <div style={{ paddingLeft: 18, marginTop: 4, display: "flex", flexDirection: "column", gap: 4, animation: "slide-in 0.2s ease" }}>
                  {(files[folder] ?? []).map(f => <div key={f} style={fileRowStyle}>{f}</div>)}
                </div>
              )}
            </div>
          ))}
          <div style={{ ...dirRowStyle, opacity: 0.5 }}><span>📁</span><span>Documents</span></div>
        </div>
      </div>
      <div style={{ padding: "8px 12px", borderRadius: 9, background: "var(--interactive-pill-bg)", border: "1px solid var(--interactive-pill-border)", fontSize: 11, color: "var(--interactive-pill-text)", textAlign: "center", fontWeight: 600 }}>
        📁 = Folder (a group) &nbsp;|&nbsp; 📄 = File (one piece of stuff)
      </div>
    </div>
  );
}

function StorageYourHome() {
  type TreeNode = Record<string, Record<string, null> | null>;
  const [path, setPath] = useState<string[]>([]);
  const tree = HOME_FOLDER_TREE as unknown as TreeNode;
  const current = path.reduce((node: TreeNode, seg) => {
    const child = node[seg];
    return (child && typeof child === "object") ? (child as TreeNode) : {};
  }, tree);
  const isFile = (name: string) => current[name] === null;
  return (
    <div style={card}>
      <div style={cardHint}>Navigate your home folder — click folders to enter</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, marginBottom: 8, flexWrap: "wrap" }}>
        <span onClick={() => setPath([])} style={{ cursor: "pointer", color: "var(--color-emerald)", textDecoration: "underline" }}>🏠 home/student</span>
        {path.map((seg, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: "var(--interactive-muted)" }}>/</span>
            <span onClick={() => setPath(p => p.slice(0, i + 1))} style={{ cursor: "pointer", color: "var(--color-emerald)", textDecoration: "underline" }}>{seg}</span>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {path.length > 0 && (
          <div onClick={() => setPath(p => p.slice(0, -1))} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.2)", fontSize: 12, fontWeight: 600, color: "var(--interactive-muted)", cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}>
            <span>↩</span><span>.. (go back)</span>
          </div>
        )}
        {Object.keys(current).map(name => (
          <div key={name} onClick={() => { if (!isFile(name)) setPath(p => [...p, name]); }}
            style={{ padding: "9px 12px", borderRadius: 9, background: isFile(name) ? "rgba(245,158,11,0.08)" : "rgba(6,182,212,0.10)", border: `1px solid ${isFile(name) ? "rgba(245,158,11,0.2)" : "rgba(6,182,212,0.2)"}`, fontSize: 13, fontWeight: 600, color: "var(--color-text)", cursor: isFile(name) ? "default" : "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", animation: "pop-in 0.25s ease" }}>
            <span>{isFile(name) ? "📄" : "📁"}</span>
            <span>{name}</span>
            {!isFile(name) && <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--interactive-muted)" }}>enter →</span>}
          </div>
        ))}
        {Object.keys(current).length === 0 && <div style={{ padding: "16px", textAlign: "center", color: "var(--interactive-muted)", fontSize: 12, fontStyle: "italic" }}>This folder is empty</div>}
      </div>
      <div style={{ padding: "8px 12px", borderRadius: 9, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 11, color: "var(--interactive-body)", textAlign: "center" }}>
        💡 This is exactly how Linux works. You'll navigate real folders like this in the terminal!
      </div>
    </div>
  );
}

// ─── Legacy slide components ──────────────────────────────────────────────────

function LegacyFilesAndDirs() {
  return (
    <div style={card}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {[{ pad: 0, icon: "📁", label: "/" }, { pad: 16, icon: "📁", label: "home" }, { pad: 32, icon: "📁", label: "student" }, { pad: 48, icon: "📄", label: "notes.txt" }, { pad: 48, icon: "📁", label: "projects" }].map(({ pad, icon, label }) => (
          <div key={`${pad}-${label}`} style={{ paddingLeft: pad + 12, padding: `8px 12px 8px ${pad + 12}px`, borderRadius: 7, background: icon === "📁" ? "rgba(6,182,212,0.08)" : "rgba(245,158,11,0.08)", border: `1px solid ${icon === "📁" ? "rgba(6,182,212,0.15)" : "rgba(245,158,11,0.15)"}`, fontSize: 12, fontWeight: 600, color: "var(--color-text)" }}>
            {icon} {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function LegacyHardwareParts() {
  return (
    <div style={card}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {[["CPU", "Executes instructions"], ["Memory", "Holds active data"], ["Storage", "Keeps data long-term"], ["I/O", "Connects to world"]].map(([n, l]) => (
          <div key={n} style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.3)", border: "1px solid var(--interactive-card-border)", display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontWeight: 900, color: "var(--color-text)" }}>{n}</div>
            <div style={{ fontSize: 12, color: "var(--interactive-body)" }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultIllustration() {
  return (
    <div style={card}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[["See", "Look beneath"], ["Reason", "Understand"], ["Build", "Apply it"]].map(([n, l]) => (
          <div key={n} style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.3)", border: "1px solid var(--interactive-card-border)", display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontWeight: 900, color: "var(--color-text)" }}>{n}</div>
            <div style={{ fontSize: 12, color: "var(--interactive-body)", lineHeight: 1.5 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const outerShell: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  background: "radial-gradient(circle at top left, var(--interactive-spot-1), transparent 32%), radial-gradient(circle at bottom right, var(--interactive-spot-2), transparent 36%), linear-gradient(180deg, var(--interactive-bg-top), var(--interactive-bg-bottom))",
  borderRadius: 12,
  border: "1px solid var(--interactive-border)",
  boxShadow: "0 18px 40px var(--interactive-shadow)",
};
const header: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid var(--interactive-divider)", flexShrink: 0, gap: 12 };
const footer: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: "1px solid var(--interactive-divider)", flexShrink: 0, background: "var(--interactive-footer-bg)" };
const card: CSSProperties = { padding: "16px", borderRadius: 14, background: "var(--interactive-card-bg)", border: "1px solid var(--interactive-card-border)", display: "flex", flexDirection: "column", gap: 10 };
const cardHint: CSSProperties = { fontSize: 10, fontWeight: 800, color: "var(--interactive-kicker)", textTransform: "uppercase", letterSpacing: "0.08em" };
const dirRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.18)", color: "var(--color-text)", fontWeight: 600, fontSize: 13 };
const fileRowStyle: CSSProperties = { padding: "7px 12px", borderRadius: 7, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, color: "var(--color-text)", fontWeight: 500 };
