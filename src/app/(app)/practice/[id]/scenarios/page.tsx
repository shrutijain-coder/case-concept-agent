import { CaseMaterial } from "@/components/case-material";
import { ScenarioSequence } from "@/components/scenario-sequence";
import { SubmitButton } from "@/components/submit-button";
import { requireOwnedExercise } from "@/lib/auth/guard";
import { requireCase } from "@/lib/content/cases";
import { goToModalityAction } from "@/lib/practice/actions";

export default async function ScenariosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { exercise } = await requireOwnedExercise(id);
  const clinicalCase = requireCase(exercise.caseId);

  const total = clinicalCase.scenarios.length;
  const seen = exercise.scenariosViewed.filter((scenarioId) =>
    clinicalCase.scenarios.some((scenario) => scenario.id === scenarioId),
  ).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        Short exchanges from sessions with this client. Each one adds something the vignette
        does not contain. {seen} of {total} opened.
      </p>

      <CaseMaterial clinicalCase={clinicalCase} viewedScenarioIds={exercise.scenariosViewed} />

      <ScenarioSequence
        exerciseId={exercise.id}
        scenarios={clinicalCase.scenarios}
        initiallyViewed={exercise.scenariosViewed}
      />

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <form action={goToModalityAction}>
          <input type="hidden" name="exerciseId" value={exercise.id} />
          <SubmitButton pendingLabel="Loading…">Continue to conceptualisation</SubmitButton>
        </form>
        {seen < total ? (
          <p className="text-[13px] text-ink-muted">
            You can move on without opening all of them — but the AI will only ask about the
            material you have actually seen.
          </p>
        ) : null}
      </div>
    </div>
  );
}
