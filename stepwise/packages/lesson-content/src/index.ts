/**
 * @repo/lesson-content
 *
 * Single source of truth for all interactive lesson illustration data.
 * Every piece of content used in slide illustrations lives here.
 * Add data for new challenges by adding new files and re-exporting from index.ts.
 *
 * IMPORTANT: This package exports plain data objects only — no React, no JSX.
 * React components that render this data live in apps/web/components/interactive/.
 */

export * from "./linux-aethera/illustrations";
export * from "./linux-aethera/slide-configs";
export * from "./git-aethera/illustrations";
export * from "./git-aethera/slide-configs";
