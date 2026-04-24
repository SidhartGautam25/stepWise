/**
 * lib/courses.ts
 * Static course/track definitions.
 * Add new courses here — they flow through to the home page automatically.
 */

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

export const COURSES: Course[] = [
  {
    id: "javascript-fundamentals",
    title: "JavaScript Fundamentals",
    tagline: "From zero to async/await",
    description:
      "Explore JavaScript from the ground up — variables, closures, Promises, async patterns, and DOM interactions. Each step builds on the last in your real local environment.",
    icon: "⚡",
    language: "JavaScript",
    difficulty: "Beginner",
    status: "available",
    questCount: 12,
    tags: ["Variables", "Functions", "Promises", "Async/Await", "DOM"],
    accentColor: "amber",
  },
  {
    id: "typescript-mastery",
    title: "TypeScript Mastery",
    tagline: "Type-safe everything",
    description:
      "Discover TypeScript's type system step by step — interfaces, generics, utility types, and advanced patterns. Write code the way professional teams do.",
    icon: "🔷",
    language: "TypeScript",
    difficulty: "Intermediate",
    status: "available",
    questCount: 10,
    tags: ["Types", "Interfaces", "Generics", "Utility Types", "Decorators"],
    accentColor: "indigo",
  },
  {
    id: "nodejs-backend",
    title: "Node.js Backend",
    tagline: "Build APIs that scale",
    description:
      "Guided exploration of Node.js server-side patterns — event loop, streams, HTTP modules, and building production-ready REST endpoints from scratch.",
    icon: "🟢",
    language: "Node.js",
    difficulty: "Intermediate",
    status: "available",
    questCount: 8,
    tags: ["HTTP", "Streams", "Events", "REST", "File System"],
    accentColor: "emerald",
  },
  {
    id: "git-workflows",
    title: "Git & Version Control",
    tagline: "Collaborate like pros",
    description:
      "Navigate Git from commits to complex branching strategies. Understand rebasing, cherry-picking, and team workflows through hands-on terminal exercises.",
    icon: "🌿",
    language: "Git",
    difficulty: "Beginner",
    status: "available",
    questCount: 6,
    tags: ["Commits", "Branching", "Merging", "Rebasing", "Pull Requests"],
    accentColor: "emerald",
  },
  {
    id: "bash-scripting",
    title: "Shell & Bash Scripting",
    tagline: "Automate your workflow",
    description:
      "From basic commands to powerful shell scripts — pipe, redirect, variables, loops, and building CLI tools. Navigate any Unix environment with confidence.",
    icon: "🖥️",
    language: "Bash",
    difficulty: "Beginner",
    status: "coming-soon",
    questCount: 7,
    tags: ["Shell", "Pipes", "Scripts", "Cron", "CLI Tools"],
    accentColor: "cyan",
  },
  {
    id: "react-patterns",
    title: "React Design Patterns",
    tagline: "Components done right",
    description:
      "Explore React through real component challenges — hooks, context, performance patterns, and advanced compositions. Build instincts, not habits.",
    icon: "⚛️",
    language: "React",
    difficulty: "Advanced",
    status: "coming-soon",
    questCount: 9,
    tags: ["Hooks", "Context", "Memo", "Patterns", "Performance"],
    accentColor: "cyan",
  },
];
