# @repo/lesson-content
The rich interactive core of StepWise lessons.

This package houses the logic-heavy assets, illustrations, and interactive configurations that power the platform's immersive educational experience.

## 📁 Structure
- `src/index.ts`: The main entry point that exports lesson configurations.
- `src/[challenge-id]/`: Challenge-specific directories containing:
    - `illustrations.ts`: Mapping of step IDs to React Illustration components.
    - `slide-configs.ts`: Declarative configurations for complex interactive sequences.

## 🚀 Adding New Content
To add interactive logic for a new challenge:
1. Create a directory named after your `challenge-id`.
2. Define your interactive sequences and map them in `illustrations.ts`.
3. Export them from the main index.

## 🔗 Linkage with API/DB
While the database stores the challenge metadata and step order, the `apps/web` frontend uses the `challengeId` returned by the API to dynamically load the rich content from this package. This allows us to keep the database lightweight while delivering deeply interactive multi-sensory lessons.
