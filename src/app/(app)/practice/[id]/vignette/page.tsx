import { SubmitButton } from "@/components/submit-button";
import { Badge, Notice, Panel, PanelBody, PanelHeader } from "@/components/ui";
import { requireOwnedExercise } from "@/lib/auth/guard";
import { requireCase } from "@/lib/content/cases";
import { goToScenariosAction } from "@/lib/practice/actions";

/** Screen 5 — the vignette, presented in sections rather than one wall of text. */
export default async function VignettePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { exercise } = await requireOwnedExercise(id);
  const clinicalCase = requireCase(exercise.caseId);
  const hasScenarios = clinicalCase.scenarios.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{clinicalCase.difficulty}</Badge>
        {clinicalCase.availableModalities.map((modality) => (
          <Badge key={modality} tone="brand">
            {modality.toUpperCase()}
          </Badge>
        ))}
        <span className="text-[13px] text-ink-subtle">
          about {clinicalCase.estimatedMinutes} minutes
        </span>
      </div>

      {clinicalCase.reviewStatus !== "published" ? (
        <Notice tone="caution" title="Draft case material">
          <p>
            This case has not yet been through clinical review. Treat it as practice
            material for reasoning, not as a worked example of good formulation.
          </p>
        </Notice>
      ) : null}

      {clinicalCase.contentNote ? (
        <Notice title="About this case">
          <p>{clinicalCase.contentNote}</p>
        </Notice>
      ) : null}

      {clinicalCase.vignette.map((section) => (
        <Panel key={section.id}>
          <PanelHeader title={section.title} />
          <PanelBody>
            <div className="prose-clinical text-sm text-ink">
              {section.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </PanelBody>
        </Panel>
      ))}

      <div className="flex items-center gap-3 pt-1">
        <form action={goToScenariosAction}>
          <input type="hidden" name="exerciseId" value={exercise.id} />
          <SubmitButton pendingLabel="Loading…">
            {hasScenarios ? "Continue to scenarios" : "Start conceptualisation"}
          </SubmitButton>
        </form>
        <p className="text-[13px] text-ink-muted">
          {hasScenarios
            ? "Short client–therapist exchanges add information the vignette leaves out."
            : "You can re-read the vignette at any point."}
        </p>
      </div>
    </div>
  );
}
