# @repo/interactive-engine
The "Visual Language" of StepWise. A collection of highly reusable, premium React components designed for multi-sensory educational experiences.

This package defines the interactive components that bridge the gap between abstract code concepts and clear visual mental models.

## 🧱 Core Components

### 🏗 Layout Shells
- **`LessonSequenceShell`**: The primary layout container for interactive lessons, managing the split between content and visualization.
- **`IllustrationShell`**: A base wrapper for all dynamic visual analogs.

### 📊 Visualizers
- **`GitCommitGraph`**: Renders a beautiful SVG-based commit history with branch support.
- **`GitStagingArea`**: Visualizes the flow of files from Workspace to Index to Commit.
- **`FileNavigator`**: A clean, sidebar-style tree view of the simulated virtual filesystem (VFS).
- **`CollapsibleTree`**: A generic, animated tree structure for visualizing data or structures.

### 🕹 Interactions
- **`VisualWorld`**: A master component that renders different illustrations based on a configuration. 
- **`ClickRevealGrid`**: A grid that hides/shows info on interaction, perfect for terminology memory challenges.
- **`InteractiveBuckets`**: Drag-and-drop categorization interaction.
- **`ComparePanel`**: A side-by-side comparison tool for code or state.

## 🎨 Design Tokens
The engine consumes from `@repo/interactive-engine/src/tokens.ts` and `globals.css` to ensure a consistent, premium look across all visualizations.

## 🚀 Usage Example
```tsx
import { GitCommitGraph } from "@repo/interactive-engine";

export function MyLesson() {
  return (
    <GitCommitGraph 
      commits={[{ hash: 'abc', message: 'feat: init' }]} 
      activeBranch="main" 
    />
  );
}
```

---
StepWise Interactive Engine is designed to be **glitch-free**, **highly responsive**, and **visually stunning**.
