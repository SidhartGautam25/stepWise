"use client";

import { useEffect } from "react";
import { ENGINE_KEYFRAMES } from "./tokens";

const STYLE_ID = "ie-keyframes";

/**
 * useEngineStyles — injects animation keyframes into <head> once.
 * Call this inside any component that uses engine animations.
 * Multiple calls are safe — it checks for the ID first.
 */
export function useEngineStyles() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = ENGINE_KEYFRAMES;
    document.head.appendChild(el);
  }, []);
}
