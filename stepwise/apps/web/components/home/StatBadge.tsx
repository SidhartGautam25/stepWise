/**
 * components/home/StatBadge.tsx
 * Compact inline stat chip — e.g. "12 Quests", "JavaScript", "Beginner"
 */

import React from "react";

type Variant = "indigo" | "emerald" | "amber" | "rose" | "cyan" | "ghost";

interface StatBadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  icon?: string;
}

export function StatBadge({ children, variant = "ghost", icon }: StatBadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
