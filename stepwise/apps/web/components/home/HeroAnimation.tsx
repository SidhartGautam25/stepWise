"use client";
/**
 * components/home/HeroAnimation.tsx
 * Animated floating code particles for the hero section.
 * Client component — runs only in browser.
 */

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  text: string;
  color: string;
}

const CODE_FRAGMENTS = [
  "npx stepwise init",
  "stepwise test",
  "✓ step-01 passed",
  "→ step-02 unlocked",
  "const fn = () =>",
  "git commit -m",
  "npm run build",
  "tsc --strict",
  "bash script.sh",
  "chmod +x run.sh",
  "echo $PATH",
  "cd projects/",
  "ls -la",
  "grep -r 'pattern'",
  "export default",
  "interface Config",
  "async/await",
  "Promise.all([])",
];

export function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Detect theme for colors
    const getColors = () => {
      const theme = document.documentElement.getAttribute("data-theme") ?? "dark";
      return theme === "dark"
        ? ["rgba(108,99,255,", "rgba(16,185,129,", "rgba(167,139,250,"]
        : ["rgba(91,70,241,", "rgba(5,150,105,", "rgba(124,110,247,"];
    };

    // Init particles
    const initParticles = () => {
      const colors = getColors();
      particlesRef.current = Array.from({ length: 22 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25 - 0.12,
        opacity: Math.random() * 0.35 + 0.08,
        size: Math.random() * 2.5 + 10,
        text: CODE_FRAGMENTS[Math.floor(Math.random() * CODE_FRAGMENTS.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    };
    initParticles();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (const p of particles) {
        ctx.font = `${p.size}px "Fira Code", monospace`;
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fillText(p.text, p.x, p.y);

        p.x += p.vx;
        p.y += p.vy;

        // Fade out near top
        if (p.y < canvas.height * 0.15) {
          p.opacity -= 0.003;
        }

        // Reset when off screen or faded
        if (p.y < -40 || p.opacity <= 0.02 || p.x < -200 || p.x > canvas.width + 200) {
          const colors = getColors();
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 20;
          p.vy = (Math.random() - 0.5) * 0.2 - 0.15;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.opacity = Math.random() * 0.3 + 0.08;
          p.text = CODE_FRAGMENTS[Math.floor(Math.random() * CODE_FRAGMENTS.length)];
          p.color = colors[Math.floor(Math.random() * colors.length)];
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
