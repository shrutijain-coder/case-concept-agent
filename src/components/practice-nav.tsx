"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ExerciseStage } from "@/lib/db/types";
import { stageIndex } from "@/lib/practice/summary";

interface StepItem {
  stage: ExerciseStage;
  pathSegment: string;
  label: string;
}

const ALL_STEPS: StepItem[] = [
  { stage: "vignette", pathSegment: "vignette", label: "Vignette" },
  { stage: "scenarios", pathSegment: "scenarios", label: "Scenarios" },
  { stage: "modality", pathSegment: "modality", label: "Framework" },
  { stage: "conceptualisation", pathSegment: "conceptualisation", label: "Formulation" },
  { stage: "critical_thinking", pathSegment: "critical-thinking", label: "Questions" },
  { stage: "self_review", pathSegment: "self-review", label: "Self-review" },
  { stage: "reflection", pathSegment: "reflection", label: "Reflection" },
];

export function PracticeNav({
  exerciseId,
  currentMaxStage,
  hasScenarios,
}: {
  exerciseId: string;
  currentMaxStage: ExerciseStage;
  hasScenarios: boolean;
}) {
  const pathname = usePathname();
  const maxIdx = stageIndex(currentMaxStage);

  const steps = ALL_STEPS.filter((step) => step.stage !== "scenarios" || hasScenarios);

  return (
    <nav aria-label="Practice progress" className="border-b border-line pb-3 overflow-x-auto">
      <ol className="flex items-center gap-1.5 min-w-max text-[13px]">
        {steps.map((step, idx) => {
          const stepHref = `/practice/${exerciseId}/${step.pathSegment}`;
          const isCurrentPage = pathname === stepHref || pathname.startsWith(`${stepHref}/`);
          const isUnlocked = stageIndex(step.stage) <= maxIdx;
          const stepNum = idx + 1;

          if (isCurrentPage) {
            return (
              <li key={step.stage} className="flex items-center gap-1.5">
                {idx > 0 ? <span className="text-ink-subtle px-0.5">&rsaquo;</span> : null}
                <span
                  aria-current="step"
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-tint px-2.5 py-1 font-semibold text-brand border border-brand/30"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-white">
                    {stepNum}
                  </span>
                  <span>{step.label}</span>
                </span>
              </li>
            );
          }

          if (isUnlocked) {
            return (
              <li key={step.stage} className="flex items-center gap-1.5">
                {idx > 0 ? <span className="text-ink-subtle px-0.5">&rsaquo;</span> : null}
                <Link
                  href={stepHref}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sunken border border-line-strong text-[10px] text-ink-muted">
                    {stepNum}
                  </span>
                  <span>{step.label}</span>
                </Link>
              </li>
            );
          }

          return (
            <li key={step.stage} className="flex items-center gap-1.5">
              {idx > 0 ? <span className="text-ink-subtle px-0.5">&rsaquo;</span> : null}
              <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-normal text-ink-subtle opacity-50 cursor-not-allowed">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sunken border border-line text-[10px] text-ink-subtle">
                  {stepNum}
                </span>
                <span>{step.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
