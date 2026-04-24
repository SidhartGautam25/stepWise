/**
 * components/home/SectionLabel.tsx
 * Small eyebrow label shown above section headings.
 * Usage: <SectionLabel icon="✦">Our Approach</SectionLabel>
 */

import React from "react";

interface SectionLabelProps {
  children: React.ReactNode;
  icon?: string;
  className?: string;
}

export function SectionLabel({ children, icon = "✦", className = "" }: SectionLabelProps) {
  return (
    <div className={`section-eyebrow ${className}`}>
      <span aria-hidden="true">{icon}</span>
      {children}
    </div>
  );
}
