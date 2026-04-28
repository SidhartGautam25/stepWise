import type { ChallengeSummary } from "./api";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type CourseStatus = "available" | "coming-soon";

export interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  language: string;
  difficulty: Difficulty;
  status: CourseStatus;
  questCount: number;
  tags: string[];
  accentColor: "indigo" | "emerald" | "amber" | "rose" | "cyan";
}

const TRACK_META: Record<string, Pick<Course, "title" | "tagline" | "icon" | "accentColor">> = {
  javascript: {
    title: "JavaScript Fundamentals",
    tagline: "From functions to async workflows",
    icon: "⚡",
    accentColor: "amber",
  },
  typescript: {
    title: "TypeScript Mastery",
    tagline: "Type-safe systems thinking",
    icon: "🔷",
    accentColor: "indigo",
  },
  node: {
    title: "Node.js Backend",
    tagline: "Build servers that feel real",
    icon: "🟢",
    accentColor: "emerald",
  },
  "web-terminal": {
    title: "Terminal Worlds",
    tagline: "Learn by navigating real shells",
    icon: "🖥️",
    accentColor: "cyan",
  },
  bash: {
    title: "Shell & Bash",
    tagline: "Automate your workflow",
    icon: "🖥️",
    accentColor: "cyan",
  },
  git: {
    title: "Git & Version Control",
    tagline: "Understand history and collaboration",
    icon: "🌿",
    accentColor: "emerald",
  },
  rust: {
    title: "Rust Systems",
    tagline: "Safety, speed, and ownership",
    icon: "🦀",
    accentColor: "rose",
  },
};

function toDifficulty(value?: string): Difficulty {
  if (value === "advanced") return "Advanced";
  if (value === "intermediate") return "Intermediate";
  return "Beginner";
}

function pickGroupKey(challenge: ChallengeSummary) {
  return challenge.runtime === "node" ? "node" : challenge.language.toLowerCase();
}

export function deriveCoursesFromChallenges(challenges: ChallengeSummary[]): Course[] {
  const groups = new Map<string, ChallengeSummary[]>();

  for (const challenge of challenges) {
    const key = pickGroupKey(challenge);
    const existing = groups.get(key);
    if (existing) existing.push(challenge);
    else groups.set(key, [challenge]);
  }

  const courses: Course[] = [];

  for (const [key, items] of groups.entries()) {
    const meta = TRACK_META[key];
    const sample = items[0];
    if (!sample) continue;

    const allTags = Array.from(
      new Set(items.flatMap((item) => item.tags).filter(Boolean)),
    ).slice(0, 5);

    courses.push({
      id: key,
      title: meta?.title ?? sample.language,
      tagline: meta?.tagline ?? `${sample.language} guided exploration`,
      description:
        sample.description ??
        `Explore ${sample.language} through guided quests that build practical instincts one step at a time.`,
      icon: meta?.icon ?? "🧩",
      language: sample.language,
      difficulty: toDifficulty(sample.difficulty),
      status: "available",
      questCount: items.length,
      tags: allTags.length > 0 ? allTags : [sample.runtime, sample.challengeType],
      accentColor: meta?.accentColor ?? "indigo",
    });
  }

  return courses
    .sort((a, b) => a.title.localeCompare(b.title));
}
