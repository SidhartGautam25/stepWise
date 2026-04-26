/**
 * @repo/interactive-engine — shared CSS variable tokens
 *
 * All components reference these tokens.
 * They resolve at runtime via the CSS variables defined in the web app's theme.
 * Add new tokens here when you need additional theme values in a component.
 */

export const T = {
  // Text
  text:         "var(--color-text)",
  muted:        "var(--interactive-muted)",
  body:         "var(--interactive-body)",
  kicker:       "var(--interactive-kicker)",

  // Brand colours
  emerald:      "var(--color-emerald)",
  indigo:       "var(--color-indigo)",

  // Cards / surfaces
  cardBg:       "var(--interactive-card-bg)",
  cardBorder:   "var(--interactive-card-border)",

  // Pills
  pillBg:       "var(--interactive-pill-bg)",
  pillText:     "var(--interactive-pill-text)",
  pillBorder:   "var(--interactive-pill-border)",

  // Dot (progress)
  dot:          "var(--interactive-dot)",

  // Footer
  footerBg:     "var(--interactive-footer-bg)",

  // Semantic colour helpers (hex-free, purely CSS-var)
  border:       "var(--color-border)",
  surface:      "var(--color-surface)",

  // Semantic accent shortcuts (RGBA strings - kept as literals)
  emeraldAlpha: (a: number) => `rgba(34,197,94,${a})`,
  indigoAlpha:  (a: number) => `rgba(99,102,241,${a})`,
  amberAlpha:   (a: number) => `rgba(245,158,11,${a})`,
  redAlpha:     (a: number) => `rgba(239,68,68,${a})`,
  cyanAlpha:    (a: number) => `rgba(6,182,212,${a})`,
  slateAlpha:   (a: number) => `rgba(100,116,139,${a})`,
} as const;

/** The CSS animation keyframes injected once per page. */
export const ENGINE_KEYFRAMES = `
  @keyframes ie-slide-in   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ie-pop-in     { 0%{opacity:0;transform:scale(0.82)} 100%{opacity:1;transform:scale(1)} }
  @keyframes ie-flow-right { 0%{transform:translateX(-50%);opacity:0} 100%{transform:translateX(0);opacity:1} }
  @keyframes ie-bounce-in  { 0%{transform:scale(0)} 60%{transform:scale(1.12)} 100%{transform:scale(1)} }
  @keyframes ie-float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes ie-pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.25)} 50%{box-shadow:0 0 0 8px rgba(34,197,94,0)} }
`;
