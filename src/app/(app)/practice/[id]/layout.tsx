import Link from "next/link";
import type { ReactNode } from "react";

import { PracticeNav } from "@/components/practice-nav";
import { requireOwnedExercise } from "@/lib/auth/guard";
import { requireCase } from "@/lib/content/cases";
import { stageIndex, stageLabel, TOTAL_STAGES } from "@/lib/practice/summary";

/**
 * Practice shell. Owns the ownership check for everything under
 * /practice/[id], so no child page can be reached with someone else's id.
 */
export default async function PracticeLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { exercise } = await requireOwnedExercise(id);
  const clinicalCase = requireCase(exercise.caseId);
  const step = Math.min(stageIndex(exercise.stage) + 1, TOTAL_STAGES);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h1 className="truncate">{clinicalCase.title}</h1>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Step {step} of {TOTAL_STAGES} &middot; {stageLabel(exercise.stage)}
          </p>
        </div>
        <Link href="/dashboard" className="text-[13px] text-ink-muted hover:underline">
          Save and leave
        </Link>
      </div>

      <PracticeNav
        exerciseId={exercise.id}
        currentMaxStage={exercise.stage}
        hasScenarios={clinicalCase.scenarios.length > 0}
      />

      {children}

      <p className="border-t border-line pt-4 text-[12px] text-ink-subtle">
        Hypothetical case. Do not enter identifiable information about real clients. This
        tool does not replace supervision.
      </p>
    </div>
  );
}
