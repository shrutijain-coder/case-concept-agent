"use client";

import { useState, useTransition } from "react";

import { Button, Panel, PanelBody, PanelHeader } from "@/components/ui";
import type { Scenario } from "@/lib/content/cases";
import { markScenarioViewedAction } from "@/lib/practice/actions";

/**
 * Screen 6 — scenarios revealed in order.
 *
 * Linear rather than branching, which is all V1 needs. Anything already
 * revealed stays on the page, so moving backwards is just scrolling. Each
 * reveal is recorded server-side; the AI is only ever told about scenarios
 * the therapist has actually opened.
 */
export function ScenarioSequence({
  exerciseId,
  scenarios,
  initiallyViewed,
}: {
  exerciseId: string;
  scenarios: Scenario[];
  initiallyViewed: string[];
}) {
  const [viewed, setViewed] = useState<string[]>(initiallyViewed);
  const [pending, startTransition] = useTransition();

  const ordered = [...scenarios].sort((a, b) => a.sequence - b.sequence);
  const revealed = ordered.filter((scenario) => viewed.includes(scenario.id));
  const next = ordered.find((scenario) => !viewed.includes(scenario.id));

  function reveal(scenarioId: string) {
    setViewed((current) => [...current, scenarioId]);
    startTransition(async () => {
      await markScenarioViewedAction(exerciseId, scenarioId);
    });
  }

  return (
    <div className="space-y-4">
      {revealed.map((scenario) => (
        <Panel key={scenario.id}>
          <PanelHeader
            title={`${scenario.sequence}. ${scenario.title}`}
            description={scenario.context}
          />
          <PanelBody className="space-y-3">
            <div className="space-y-2">
              {scenario.dialogue.map((line, index) => (
                <p key={index} className="text-sm text-ink">
                  <span className="font-medium">{line.speaker}:</span>{" "}
                  <span className="text-ink-muted">&ldquo;{line.text}&rdquo;</span>
                </p>
              ))}
            </div>

            <div className="border-t border-line pt-3">
              <p className="text-[13px] text-ink-muted">
                <span className="font-medium text-ink">Worth noticing.</span>{" "}
                {scenario.additionalInformation}
              </p>
            </div>
          </PanelBody>
        </Panel>
      ))}

      {next ? (
        <Panel>
          <PanelBody className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">
                {next.sequence}. {next.title}
              </p>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                {revealed.length
                  ? "Read the exchange before moving on."
                  : "Start with the first exchange."}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => reveal(next.id)}
            >
              Open exchange
            </Button>
          </PanelBody>
        </Panel>
      ) : null}
    </div>
  );
}
