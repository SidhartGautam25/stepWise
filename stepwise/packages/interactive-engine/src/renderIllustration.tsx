"use client";

/**
 * renderIllustration — the universal data-driven renderer.
 *
 * Given an IllustrationConfig (plain data), renders the correct engine
 * component automatically. No if-chains, no JSX at the call site.
 *
 * Usage:
 * ```ts
 * import { renderIllustration } from "@repo/interactive-engine";
 * renderIllustration({ type: "ExpandableCardList", items: [...] })
 * ```
 */

import type { ReactNode } from "react";
import { Fragment } from "react";
import type { IllustrationConfig } from "./IllustrationConfig";

import { ExpandableCardList }  from "./components/ExpandableCardList";
import { ClickRevealGrid }     from "./components/ClickRevealGrid";
import { StepSimulator }       from "./components/StepSimulator";
import { ComparePanel }        from "./components/ComparePanel";
import { JourneyFlow }         from "./components/JourneyFlow";
import { InteractiveBuckets }  from "./components/InteractiveBuckets";
import { CollapsibleTree }     from "./components/CollapsibleTree";
import { FileNavigator }       from "./components/FileNavigator";
import { InfoCallout }         from "./components/InfoCallout";
import { GitCommitGraph }      from "./components/GitCommitGraph";
import { GitStagingArea }      from "./components/GitStagingArea";
import { LessonSequenceShell } from "./components/LessonSequenceShell";
import { VisualWorld }         from "./components/VisualWorld";
import { SimulatedTerminal }   from "@repo/terminal-engine";

export interface RenderIllustrationRuntime {
  terminalState?: {
    vfs?: unknown;
    cwd?: string[];
    git?: {
      initialized?: boolean;
    };
  };
  isGit?: boolean;
  onCompleted?: (stepId: string) => void;
}

export function renderIllustration(
  config: IllustrationConfig,
  runtime: RenderIllustrationRuntime = {},
): ReactNode {
  switch (config.type) {
    case "ExpandableCardList":
      return (
        <ExpandableCardList
          hint={config.hint}
          items={config.items}
          multiOpen={config.multiOpen}
        />
      );

    case "ClickRevealGrid":
      return (
        <ClickRevealGrid
          hint={config.hint}
          items={config.items}
          columns={config.columns}
          detailLabel={config.detailLabel}
        />
      );

    case "StepSimulator":
      return (
        <StepSimulator
          hint={config.hint}
          actors={config.actors}
          steps={config.steps}
          startLabel={config.startLabel}
          nextLabel={config.nextLabel}
          doneMessage={config.doneMessage}
          replayLabel={config.replayLabel}
        />
      );

    case "ComparePanel":
      return (
        <ComparePanel
          hint={config.hint}
          left={config.left}
          right={config.right}
          successMessage={config.successMessage}
        />
      );

    case "JourneyFlow":
      return (
        <JourneyFlow
          hint={config.hint}
          steps={config.steps}
          storeIcon={config.storeIcon}
          storeLabel={config.storeLabel}
          startLabel={config.startLabel}
          nextLabel={config.nextLabel}
          replayLabel={config.replayLabel}
        />
      );

    case "InteractiveBuckets":
      return (
        <InteractiveBuckets
          hint={config.hint}
          items={config.items}
          source={config.source}
          destination={config.destination}
          destinationTip={config.destinationTip}
        />
      );

    case "CollapsibleTree":
      return (
        <CollapsibleTree
          hint={config.hint}
          tree={config.tree}
          tip={config.tip}
          indent={config.indent}
        />
      );

    case "FileNavigator":
      return (
        <FileNavigator
          hint={config.hint}
          tree={config.tree}
          rootLabel={config.rootLabel}
          tip={config.tip}
        />
      );

    case "InfoCallout":
      return (
        <InfoCallout
          text={config.text}
          icon={config.icon}
          variant={config.variant}
        />
      );

    case "Multi":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: config.gap ?? 12,
          }}
        >
          {config.illustrations.map((child, i) => (
            <Fragment key={i}>{renderIllustration(child)}</Fragment>
          ))}
        </div>
      );

    case "GitCommitGraph":
      return (
        <GitCommitGraph
          hint={config.hint}
          commits={config.commits}
          branches={config.branches}
          tip={config.tip}
        />
      );

    case "GitStagingArea":
      return (
        <GitStagingArea
          hint={config.hint}
          files={config.files}
          tip={config.tip}
          interactive={config.interactive}
        />
      );

    case "SimulatedTerminal":
      return (
        <SimulatedTerminal
          language={config.language}
          hint={config.hint}
          initialVfs={config.initialVfs}
          preHistory={config.preHistory}
          height={config.height ?? 280}
        />
      );

    case "LessonSequence":
      return (
        <LessonSequenceShell
          slides={config.slides}
          stepId={config.stepId}
          title={config.title}
          subtitle={config.subtitle}
          onCompleted={config.onCompleted ?? runtime.onCompleted}
          renderIllustration={(slideId) => {
            const slide = config.slides.find((candidate) => candidate.id === slideId);
            const illustration =
              config.slideIllustrations?.[slideId] ??
              (slide?.illustration as IllustrationConfig | undefined) ??
              config.fallbackIllustration;

            return illustration ? renderIllustration(illustration, runtime) : null;
          }}
        />
      );

    case "VisualWorld":
      if (!config.vfs && !runtime.terminalState?.vfs) return null;
      if (!config.cwd && !runtime.terminalState?.cwd) return null;

      return (
        <VisualWorld
          vfs={(config.vfs ?? runtime.terminalState?.vfs) as never}
          cwd={(config.cwd ?? runtime.terminalState?.cwd) as string[]}
          isGit={config.isGit ?? runtime.isGit}
          gitInited={config.gitInited ?? runtime.terminalState?.git?.initialized}
        />
      );

    default:
      return null;
  }
}
