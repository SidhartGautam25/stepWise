/**
 * git-aethera — Slide Illustration Configs v2
 *
 * Narrative arc:
 *   Welcome → World Before → Snapshot Idea → Meet Git → Terminal Practice → Branching
 *
 * Each slide ID here matches the id field in interactive-sequence.json.
 */

import type {
  IllustrationConfig,
  CommitNode,
  StagingFile,
} from "@repo/interactive-engine";

import { BRANCH_COMMITS, STAGING_FILES_DEMO, KAVYA_COMMITS } from "./illustrations";

export const GIT_SLIDE_CONFIGS: Record<string, IllustrationConfig> = {

  // ══════════════════════════════════════════════════════════════════
  // STEP: 00-welcome
  // ══════════════════════════════════════════════════════════════════

  "welcome-hi": {
    type: "ClickRevealGrid",
    hint: "Tap each card — see what Git will make possible for you",
    columns: 2,
    detailLabel: "What this means for you →",
    items: [
      {
        id: "w1",
        icon: "⏪",
        label: "Never lose working code again",
        detail: "Every time your code works, you'll take a snapshot. Disasters become a single command to undo.",
      },
      {
        id: "w2",
        icon: "🔬",
        label: "Experiment without fear",
        detail: "Try any idea — risky or not — on a branch. If it fails, delete the branch. Main code is untouched.",
      },
      {
        id: "w3",
        icon: "📖",
        label: "Read your project's whole story",
        detail: "See every change you ever made, labelled and in order. Find when anything was added or broken.",
      },
      {
        id: "w4",
        icon: "🤝",
        label: "Work with others without chaos",
        detail: "Multiple people on the same project — Git merges everyone's work intelligently.",
      },
    ],
  },

  "welcome-what-youll-do": {
    type: "JourneyFlow",
    hint: "This is the path we're taking — click through each stage",
    steps: [
      {
        icon: "📖",
        action: "Follow Kavya's story",
        result: "See the real problems every developer faces without version control",
        color: "rgba(239,68,68,0.08)",
        border: "rgba(239,68,68,0.3)",
      },
      {
        icon: "💡",
        action: "Discover the solutions",
        result: "Work out the ideas behind version control before seeing any commands",
        color: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.3)",
      },
      {
        icon: "🧩",
        action: "Meet Git",
        result: "See how Git already built every idea you just discovered — nothing arbitrary",
        color: "rgba(99,102,241,0.08)",
        border: "rgba(99,102,241,0.3)",
      },
      {
        icon: "⌨️",
        action: "Practice in the terminal",
        result: "Commands that make complete sense because you understand the why",
        color: "rgba(34,197,94,0.10)",
        border: "rgba(34,197,94,0.4)",
      },
    ],
    startLabel: "▶ See the journey",
    nextLabel: "→ Next stage",
    storeIcon: "🎓",
    storeLabel: "Git mastery",
  },

  "welcome-no-fear": {
    type: "ComparePanel",
    hint: "This is how most people learn Git — vs. how we're doing it",
    left: {
      icon: "😤",
      title: "The usual way",
      color: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.25)",
      locked: false,
      closedHint: "Click — see the painful way →",
      revealContent: [
        "1. Here are 20 commands — memorize them",
        "2. Why do they work? Doesn't matter.",
        "3. You'll figure it out when things break",
        "😰 Confused. Copying from StackOverflow forever.",
      ],
    },
    right: {
      icon: "😌",
      title: "Our way",
      color: "rgba(34,197,94,0.06)",
      border: "rgba(34,197,94,0.3)",
      closedHint: "Click — see the better way →",
      revealContent: [
        "1. Here's the problem (real, relatable, painful)",
        "2. Here's the solution that makes sense",
        "3. Here's the Git command that does it",
        "🎯 Deep understanding. Commands feel obvious.",
      ],
    },
    successMessage: "✅ You're learning the right way. Let's go!",
  },

  // ══════════════════════════════════════════════════════════════════
  // STEP: 00-world-before
  // ══════════════════════════════════════════════════════════════════

  "world-meet-kavya": {
    type: "ExpandableCardList",
    hint: "Tap each card — this is Kavya's situation",
    items: [
      {
        id: "k1",
        icon: "👩‍💻",
        label: "Kavya — learning to code",
        reveal: "She's been coding for a few weeks. Built a simple todo app. Add tasks, check them off, delete them. It works!",
      },
      {
        id: "k2",
        icon: "📄",
        label: "Her project — one file",
        reveal: "Everything is in one file: todo.js. It's saved on her laptop. No backup. No nothing. Just one file.",
      },
      {
        id: "k3",
        icon: "✅",
        label: "Everything is working",
        reveal: "Checkboxes work. Deleting works. The design looks clean. She's genuinely proud of it.",
      },
      {
        id: "k4",
        icon: "🤔",
        label: "Then she decides...",
        reveal: "\"I want to add dark mode. Users keep asking for it. How hard can it be?\" — Famous last words.",
      },
    ],
  },

  "world-disaster-1": {
    type: "JourneyFlow",
    hint: "Follow the disaster — step by step",
    steps: [
      {
        icon: "🌙",
        action: "Kavya starts adding dark mode",
        result: "She edits parts of her code she's never touched before. Looks promising after an hour...",
        color: "rgba(99,102,241,0.08)",
        border: "rgba(99,102,241,0.3)",
      },
      {
        icon: "💾",
        action: "She saves the file",
        result: "Ctrl+S. The old version is gone. Replaced. There is no \"original\" anymore.",
        color: "rgba(245,158,11,0.1)",
        border: "rgba(245,158,11,0.35)",
      },
      {
        icon: "🖥️",
        action: "She opens the app",
        result: "Nothing works. The checkboxes are gone. The font is broken. Even things she didn't touch are broken.",
        color: "rgba(239,68,68,0.1)",
        border: "rgba(239,68,68,0.35)",
      },
      {
        icon: "😭",
        action: "She tries to undo",
        result: "Ctrl+Z 40 times. The editor undoes too much — now even the working parts are gone. Blank file.",
        color: "rgba(239,68,68,0.15)",
        border: "rgba(239,68,68,0.5)",
      },
    ],
    startLabel: "▶ Watch the disaster unfold",
    nextLabel: "→ What happened next?",
    storeIcon: "💾",
    storeLabel: "Gone forever",
  },

  "world-kavya-tries-backup": {
    type: "InfoCallout",
    variant: "warning",
    icon: "🧠",
    text: "After that disaster, Kavya makes a smart decision: \"Before I change anything, I'll make a backup copy of the file first.\" This sounds like a great solution. And at first, it works perfectly. But a week later...",
  },

  "world-disaster-2": {
    type: "ExpandableCardList",
    hint: "Tap each file — can you tell what's inside from the name?",
    items: [
      {
        id: "d1",
        icon: "📦",
        label: "todo-backup-jan5.zip",
        reveal: "🤷 Was this before or after the animation bug fix? Does it have the mobile layout? No way to know.",
      },
      {
        id: "d2",
        icon: "📦",
        label: "todo-WORKING-VERSION.zip",
        reveal: "🤷 Working with WHICH features? The checkboxes? The dark mode attempt? The filter? No idea.",
      },
      {
        id: "d3",
        icon: "📦",
        label: "todo-before-darkmode.zip",
        reveal: "Oh this might be useful! But wait — does it have the animation fix from December? Kavya can't remember what she fixed when.",
      },
      {
        id: "d4",
        icon: "📦",
        label: "todo-final-v2.zip",
        reveal: "🤷 v2 of what exactly? There's no v1 file. Did she delete it? When did this become v2?",
      },
      {
        id: "d5",
        icon: "📦",
        label: "todo-USE_THIS_ONE.zip",
        reveal: "Okay this must be the most recent. But Rohan sent her an update 3 days ago... Was that included? Her brain hurts.",
      },
    ],
  },

  "world-disaster-3": {
    type: "StepSimulator",
    hint: "Watch Kavya and Rohan accidentally destroy each other's work",
    actors: [
      {
        icon: "👩‍💻",
        label: "Kavya",
        sublabel: "working on search",
        color: "rgba(99,102,241,0.1)",
        border: "rgba(99,102,241,0.4)",
      },
      {
        icon: "📂",
        label: "Project File",
        sublabel: "todo.js",
        color: "rgba(100,116,139,0.08)",
        border: "rgba(100,116,139,0.3)",
        isManager: true,
      },
      {
        icon: "👦",
        label: "Rohan",
        sublabel: "working on filters",
        color: "rgba(245,158,11,0.1)",
        border: "rgba(245,158,11,0.4)",
      },
    ],
    steps: [
      {
        from: "👩‍💻 Kavya",
        to: "📂 Project File",
        action: "Spends 3 hours coding the search feature",
      },
      {
        from: "👦 Rohan",
        to: "👩‍💻 Kavya",
        action: "Emails his updated todo.js with the filters feature",
      },
      {
        from: "👩‍💻 Kavya",
        to: "📂 Project File",
        action: "Copies Rohan's file into the project folder — replacing hers",
      },
      {
        from: "📂 Project File",
        to: "👩‍💻 Kavya",
        action: "💥 Her 3 hours of search code: gone. Only Rohan's filters remain.",
      },
    ],
    startLabel: "▶ Watch what happens",
    nextLabel: "→ Continue",
    doneMessage: "😭 Nobody made a mistake. There was just no safe way to work together.",
  },

  "world-summary": {
    type: "ClickRevealGrid",
    hint: "Tap each problem — we'll solve them one by one in the next step",
    columns: 1,
    detailLabel: "The solution approach →",
    items: [
      {
        id: "s1",
        icon: "💥",
        label: "Problem 1 — Broke working code, can't go back",
        detail: "💡 We need a way to freeze the state of our code at any moment — like taking a photograph. We should be able to go back to any photograph instantly.",
      },
      {
        id: "s2",
        icon: "🗂️",
        label: "Problem 2 — Too many copies, can't tell them apart",
        detail: "💡 We need every saved version to have a clear, descriptive label — written in plain English — so anyone can understand what's in it without opening it.",
      },
      {
        id: "s3",
        icon: "👥",
        label: "Problem 3 — Two people, one project — constant collision",
        detail: "💡 We need a central place where everyone's versions can be stored and intelligently combined — not just overwritten.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // STEP: 00-snapshot-idea
  // ══════════════════════════════════════════════════════════════════

  "snapshot-natural": {
    type: "ClickRevealGrid",
    hint: "Tap each creative field — see how they already handle versions",
    columns: 2,
    detailLabel: "How they save versions →",
    items: [
      {
        id: "n1",
        icon: "🎨",
        label: "Painters",
        detail: "Photographers take a photo of the canvas after each major stage. They can always show you what it looked like at step 3 — even if it looks totally different now.",
      },
      {
        id: "n2",
        icon: "✍️",
        label: "Authors",
        detail: "Writers save a new copy of their manuscript at the end of each draft. 'novel-draft-3.docx' is a checkpoint they can return to if they write themselves into a corner.",
      },
      {
        id: "n3",
        icon: "🏗️",
        label: "Architects",
        detail: "Architects keep every version of a blueprint. Client wanted a wall moved? They don't scrap the old blueprint — they keep it and create a new version.",
      },
      {
        id: "n4",
        icon: "🎮",
        label: "Game players",
        detail: "You know save points in games? That's literally the same idea as a commit. The game saves your exact state — health, items, position — so you can return to it.",
      },
    ],
  },

  "snapshot-the-idea": {
    type: "JourneyFlow",
    hint: "Click through — watch Kavya use snapshots correctly this time",
    steps: [
      {
        icon: "✅",
        action: "Todo app is working",
        result: "📸 Kavya takes a snapshot! Message: 'Working todo app — checkboxes working'",
        color: "rgba(34,197,94,0.08)",
        border: "rgba(34,197,94,0.35)",
      },
      {
        icon: "🌙",
        action: "She starts adding dark mode",
        result: "She edits freely — the previous snapshot is safe, no matter what she does now",
        color: "rgba(99,102,241,0.08)",
        border: "rgba(99,102,241,0.3)",
      },
      {
        icon: "💥",
        action: "Dark mode breaks everything",
        result: "It's broken. But she's not panicking — she has a snapshot from before.",
        color: "rgba(239,68,68,0.08)",
        border: "rgba(239,68,68,0.3)",
      },
      {
        icon: "⏪",
        action: "She goes back to the snapshot",
        result: "✅ ONE command — her working todo app is back. Exactly as it was. Dark mode experiment gone.",
        color: "rgba(34,197,94,0.12)",
        border: "rgba(34,197,94,0.5)",
      },
    ],
    startLabel: "▶ Watch how snapshots save her",
    nextLabel: "→ Next",
    storeIcon: "📸",
    storeLabel: "Snapshot saved!",
  },

  "snapshot-solves-1": {
    type: "ComparePanel",
    hint: "Same situation — totally different outcome",
    left: {
      icon: "😭",
      title: "Without snapshots",
      color: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.25)",
      locked: false,
      closedHint: "Kavya without snapshots →",
      revealContent: [
        "Dark mode breaks everything",
        "Ctrl+Z goes too far — loses working code too",
        "Has to rewrite from memory",
        "😭 2 hours of work gone, plus the original",
      ],
    },
    right: {
      icon: "😌",
      title: "With snapshots",
      color: "rgba(34,197,94,0.06)",
      border: "rgba(34,197,94,0.3)",
      closedHint: "Kavya with snapshots →",
      revealContent: [
        "Dark mode breaks everything",
        "She types one command to go back",
        "Working version restored instantly",
        "✅ Zero work lost. The experiment didn't cost her anything.",
      ],
    },
    successMessage: "🎉 Problem #1 completely solved!",
  },

  "snapshot-labels": {
    type: "ClickRevealGrid",
    hint: "Tap each label — see why good labels change everything",
    columns: 1,
    detailLabel: "What this label tells you →",
    items: [
      {
        id: "l1",
        icon: "❌",
        label: "todo-backup-WORKING-v2-copy",
        detail: "You have no idea what's in this. When was it? What features does it have? What was the last thing changed? Completely useless as a label.",
      },
      {
        id: "l2",
        icon: "❌",
        label: "changes",
        detail: "What changes?! This could be literally anything. You'd have to open the file and compare it manually to figure out what 'changes' means.",
      },
      {
        id: "l3",
        icon: "✅",
        label: "Fix: checkboxes disappearing on mobile screens",
        detail: "Perfect. Anyone reading this immediately knows: this snapshot fixed a specific bug. If that bug appears again, this is the snapshot to look at.",
      },
      {
        id: "l4",
        icon: "✅",
        label: "Add: search bar for filtering tasks",
        detail: "Clear. Descriptive. You know exactly what was added and where. Finding this snapshot in a year? Easy.",
      },
    ],
  },

  "snapshot-timeline": {
    type: "GitCommitGraph",
    hint: "This is what Kavya's project history looks like with good labels — click any snapshot",
    commits: KAVYA_COMMITS as CommitNode[],
    tip: "No more folder of doom. One project. A clean labelled history.",
  },

  "snapshot-shared": {
    type: "ClickRevealGrid",
    hint: "Tap to explore the solution for Problem #3 — working with others",
    columns: 2,
    detailLabel: "How this works →",
    items: [
      {
        id: "r1",
        icon: "☁️",
        label: "A shared place online (Remote)",
        detail: "Imagine a shared Google Drive — but just for code snapshots. Kavya and Rohan both connect to the same place. Their changes are stored separately until deliberately merged.",
      },
      {
        id: "r2",
        icon: "📤",
        label: "Push — send your snapshots",
        detail: "When Kavya's search feature is ready, she pushes her snapshots to the shared place. Rohan can see exactly what she changed and when.",
      },
      {
        id: "r3",
        icon: "📥",
        label: "Pull — get others' snapshots",
        detail: "When Rohan pushes his filter feature, Kavya pulls it. Git combines their changes — automatically, if they edited different parts. If they edited the same line, it asks them to decide.",
      },
      {
        id: "r4",
        icon: "🔀",
        label: "Merge — combine intelligently",
        detail: "Git doesn't just overwrite. It looks at what each person changed and merges them together. Kavya's search + Rohan's filters = both in the project, safely combined.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // STEP: 00-git-the-answer
  // ══════════════════════════════════════════════════════════════════

  "git-reveal": {
    type: "ClickRevealGrid",
    hint: "Tap each idea — see the Git command that does it",
    columns: 1,
    detailLabel: "The Git command →",
    items: [
      {
        id: "g1",
        icon: "📸",
        label: "Take a labelled snapshot",
        detail: "git add (choose what to include) → git commit -m \"your label\" (take the snapshot). That's it. One snapshot taken.",
      },
      {
        id: "g2",
        icon: "📜",
        label: "See the timeline of all snapshots",
        detail: "git log --oneline — shows every snapshot ever taken, newest first, each with its label. Clean, instant, searchable.",
      },
      {
        id: "g3",
        icon: "⏪",
        label: "Go back to any snapshot",
        detail: "git checkout <snapshot-id> — takes you back to any point in history. Your files change to match that exact moment.",
      },
      {
        id: "g4",
        icon: "☁️",
        label: "Share snapshots with others (remote)",
        detail: "git push — your snapshots go to GitHub. git pull — their snapshots come to you. Git merges automatically.",
      },
    ],
  },

  "git-three-zones": {
    type: "ComparePanel",
    hint: "Git's three zones — connected to real life",
    left: {
      icon: "🧳",
      title: "Packing for a trip",
      color: "rgba(99,102,241,0.06)",
      border: "rgba(99,102,241,0.25)",
      locked: false,
      closedHint: "The real-life analogy →",
      revealContent: [
        "🗄️ Your wardrobe = everything you own",
        "🛏️ Clothes laid on the bed = what you've chosen",
        "🧳 Packed suitcase = locked and ready to go",
        "You don't pack everything — you choose what's right for this trip",
      ],
    },
    right: {
      icon: "💻",
      title: "Git's three zones",
      color: "rgba(34,197,94,0.06)",
      border: "rgba(34,197,94,0.3)",
      closedHint: "The Git equivalent →",
      revealContent: [
        "📁 Working Directory = all your files",
        "📋 Staging Area = what you've chosen for the next snapshot",
        "🏛️ Repository = locked permanent snapshot",
        "Each snapshot is focused — not just 'everything I touched today'",
      ],
    },
    successMessage: "🎉 Staging lets you make clean, focused snapshots instead of messy saves!",
  },

  "git-why-staging": {
    type: "GitStagingArea",
    hint: "See the three zones in action — click files to move them through",
    files: [
      { name: "login.js",    status: "modified",  icon: "🔐" },
      { name: "dashboard.js", status: "untracked", icon: "📊" },
      { name: "style.css",  status: "untracked", icon: "🎨" },
    ] as StagingFile[],
    tip: "Kavya can stage login.js → commit it → then stage dashboard.js → commit separately. Two clean snapshots.",
    interactive: true,
  },

  "git-commands-revealed": {
    type: "StepSimulator",
    hint: "Watch the complete Git workflow — click through each step",
    actors: [
      {
        icon: "📁",
        label: "Working Dir",
        sublabel: "your files",
        color: "rgba(100,116,139,0.08)",
        border: "rgba(100,116,139,0.3)",
      },
      {
        icon: "📋",
        label: "Staging",
        sublabel: "the bag",
        color: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.35)",
        isManager: true,
      },
      {
        icon: "🏛️",
        label: "Repository",
        sublabel: "permanent",
        color: "rgba(34,197,94,0.08)",
        border: "rgba(34,197,94,0.4)",
      },
    ],
    steps: [
      { from: "📁 Working Dir", to: "📋 Staging",    action: "git add README.md → file moves to staging area" },
      { from: "📋 Staging",    to: "🏛️ Repository",  action: "git commit -m 'Start project' → snapshot taken and locked" },
      { from: "📁 Working Dir", to: "📋 Staging",    action: "git add app.js → next file staged for the next snapshot" },
      { from: "📋 Staging",    to: "🏛️ Repository",  action: "git commit -m 'Add task logic' → second snapshot, permanent" },
    ],
    startLabel: "▶ Watch the workflow",
    nextLabel: "→ Next",
    doneMessage: "🎉 That's the complete Git workflow. You're ready for the terminal!",
  },

  // ══════════════════════════════════════════════════════════════════
  // STEP: 04-branch
  // ══════════════════════════════════════════════════════════════════

  "branch-kavya-again": {
    type: "InfoCallout",
    variant: "warning",
    icon: "🌙",
    text: "Kavya has learned about snapshots. But she's still nervous about trying dark mode. Even with snapshots, making big changes on her main project feels risky. What if she could try it in a completely separate space — without touching the main code at all?",
  },

  "branch-parallel": {
    type: "ComparePanel",
    hint: "The book analogy — see why this idea is so powerful",
    left: {
      icon: "📖",
      title: "Writing a book",
      color: "rgba(99,102,241,0.06)",
      border: "rgba(99,102,241,0.25)",
      locked: false,
      closedHint: "How authors try alternate endings →",
      revealContent: [
        "Story is done. Ready to try a different ending.",
        "She makes a COPY of the last chapter",
        "Writes the alternate ending there",
        "If she loves it → swap it in | If not → throw the copy away, original is perfect",
      ],
    },
    right: {
      icon: "🌿",
      title: "Code branching",
      color: "rgba(34,197,94,0.06)",
      border: "rgba(34,197,94,0.3)",
      closedHint: "How Kavya uses branches →",
      revealContent: [
        "Todo app is working. Wants to try dark mode.",
        "Creates a branch — a parallel workspace",
        "Tries dark mode there. Breaks things. Fixes things.",
        "If it's ready → merge into main | If not → delete branch, main is untouched",
      ],
    },
    successMessage: "🎉 Branches = parallel universes for your code!",
  },

  "branch-visual": {
    type: "GitCommitGraph",
    hint: "Two timelines, one project — click any commit to explore",
    commits: BRANCH_COMMITS as CommitNode[],
    tip: "Green = stable main branch. Purple = dark mode experiment. Completely separate until Kavya decides to merge.",
  },

  "branch-try": {
    type: "SimulatedTerminal",
    language: "git",
    hint: "Try branching for real — this terminal is fully interactive",
    preHistory: [
      "git init",
      "echo \"# Kavya's Todo App\" > README.md",
      "git add .",
      "git commit -m \"Working todo app\"",
    ],
    height: 320,
  },
};
