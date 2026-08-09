import { redirect } from "next/navigation";

import { CaseMaterial } from "@/components/case-material";
import { ConceptualisationForm } from "@/components/conceptualisation-form";
import { Panel, PanelBody, PanelHeader } from "@/components/ui";
import { requireOwnedExercise } from "@/lib/auth/guard";
import { requireCase } from "@/lib/content/cases";
import { getTemplate } from "@/lib/content/templates";
import { getRepository } from "@/lib/db";

export default async function ConceptualisationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { exercise } = await requireOwnedExercise(id);
  if (!exercise.modalityId) redirect(`/practice/${exercise.id}/modality`);

  const clinicalCase = requireCase(exercise.caseId);
  const template = getTemplate(exercise.modalityId);
  const repo = getRepository();
  const versions = await repo.listVersions(exercise.id);
  const latest = versions.at(-1) ?? null;

  // "Update my conceptualisation" hands the therapist back this exact form
  // with their own text unchanged — the AI never rewrites it (see the
  // technical PRD's core boundary: the AI facilitates, it does not
  // formulate). What was missing is context: without a reminder of which
  // question sent them here, "go edit this yourself" isn't obvious. Show the
  // most recent question and answer only when that's actually why they're on
  // this screen — i.e. it was the last thing that happened, and they chose
  // to update rather than continue or end.
  const interactions = Boolean(exercise.submittedAt)
    ? await repo.listInteractionsForExercise(exercise.id)
    : [];
  const lastInteraction = interactions.at(-1) ?? null;
  const promptedThisRevision =
    lastInteraction?.userAction === "UPDATE_CONCEPTUALISATION" ? lastInteraction : null;

  return (
    <div className="space-y-4">
      <CaseMaterial
        clinicalCase={clinicalCase}
        viewedScenarioIds={exercise.scenariosViewed}
        defaultOpen={!latest}
      />

      {promptedThisRevision ? (
        <Panel>
          <PanelHeader
            title="What prompted this revision"
            description="The AI does not revise this for you — read your own answer back and edit the fields yourself."
          />
          <PanelBody className="space-y-3">
            <div>
              <p className="text-[12px] font-medium text-ink-muted">Question</p>
              <p className="mt-0.5 text-sm text-ink">{promptedThisRevision.question}</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-ink-muted">Your answer</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">
                {promptedThisRevision.userResponse}
              </p>
            </div>
          </PanelBody>
        </Panel>
      ) : null}

      <ConceptualisationForm
        exerciseId={exercise.id}
        template={template}
        initialDraft={exercise.draft}
        initialSavedAt={exercise.updatedAt}
        isRevision={Boolean(exercise.submittedAt)}
        currentVersionNumber={latest?.versionNumber ?? null}
      />
    </div>
  );
}
