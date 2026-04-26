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

export function renderIllustration(config: IllustrationConfig): ReactNode {
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

    default:
      return null;
  }
}
