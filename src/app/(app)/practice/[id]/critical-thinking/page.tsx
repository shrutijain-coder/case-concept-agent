import { redirect } from "next/navigation";

import { CaseMaterial } from "@/components/case-material";
import { CriticalThinkingPanel } from "@/components/critical-thinking-panel";
import { SubmitButton } from "@/components/submit-button";
import { Badge, Notice, Panel, PanelBody, PanelHeader } from "@/components/ui";
import { AI_UNAVAILABLE_NOTICE } from "@/lib/ai/fallback";
import { requireOwnedExercise } from "@/lib/auth/guard";
import { requireCase } from "@/lib/content/cases";
import { getTemplate } from "@/lib/content/templates";
import { getRepository } from "@/lib/db";
import { nextQuestionAction } from "@/lib/practice/actions";

export default async function CriticalThinkingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { exercise } = await requireOwnedExercise(id);
  if (!exercise.modalityId) redirect(`/practice/${exercise.id}/modality`);
  if (!exercise.currentVersionId) redirect(`/practice/${exercise.id}/conceptualisation`);

  const repo = getRepository();
  const clinicalCase = requireCase(exercise.caseId);
  const template = getTemplate(exercise.modalityId);
  const version = await repo.getVersion(exercise.currentVersionId);
  // Across every critical-thinking session for this exercise, not just the
  // currently active one — reopening questioning after "I'm done" starts a
  // new session, and the history here should not reset at that point.
  const interactions = await repo.listInteractionsForExercise(exercise.id);

  const open = interactions.find((interaction) => interaction.userResponse === null) ?? null;
  const answered = interactions.filter((interaction) => interaction.userResponse !== null);
  const openQuestionNumber = open
    ? interactions.findIndex((interaction) => interaction.id === open.id) + 1
    : null;
  const responses = version?.sectionResponses ?? exercise.draft;

  return (
    <div className="space-y-4">
      <div className="lg:hidden">
        <CaseMaterial
          clinicalCase={clinicalCase}
          viewedScenarioIds={exercise.scenariosViewed}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-4">
          {open ? (
            <>
              {open.source === "fallback" ? (
                <Notice tone="caution">
                  <p>{AI_UNAVAILABLE_NOTICE}</p>
                </Notice>
              ) : null}
              <CriticalThinkingPanel
                exerciseId={exercise.id}
                question={open}
                questionNumber={openQuestionNumber ?? open.sequence}
                answeredCount={answered.length}
              />
            </>
          ) : (
            <Panel>
              <PanelHeader
                title={answered.length ? "Ready for the next question" : "Critical thinking"}
                description={
                  answered.length
                    ? `${answered.length} answered so far. Stop whenever you have got what you need.`
                    : "The questions below are here to make you examine your own reasoning. Nothing is scored, and there is no correct set of answers."
                }
              />
              <PanelBody>
                <form action={nextQuestionAction}>
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <SubmitButton pendingLabel="Thinking through your next question…">
                    {answered.length ? "Ask another question" : "Ask the first question"}
                  </SubmitButton>
                </form>
              </PanelBody>
            </Panel>
          )}

          {answered.length ? (
            <Panel>
              <PanelHeader title="Earlier questions" />
              <ul>
                {answered.map((interaction) => (
                  <li
                    key={interaction.id}
                    className="border-b border-line px-5 py-3.5 last:border-b-0"
                  >
                    <p className="text-sm text-ink">{interaction.question}</p>
                    <p className="mt-1.5 whitespace-pre-wrap text-[13px] text-ink-muted">
                      {interaction.userResponse}
                    </p>
                    {interaction.userAction === "UPDATE_CONCEPTUALISATION" ? (
                      <p className="mt-1.5 text-[12px] text-ink-subtle">
                        You revised the conceptualisation after this one.
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>

        {/* Desktop: the formulation stays visible next to the question. */}
        <aside className="hidden lg:block lg:sticky lg:top-6">
          <Panel>
            <PanelHeader
              title="Your conceptualisation"
              action={<Badge tone="brand">{template.name}</Badge>}
            />
            <PanelBody className="max-h-[70vh] space-y-3 overflow-y-auto">
              {template.sections.map((section) => {
                const value = (responses[section.id] ?? "").trim();
                if (!value) return null;
                return (
                  <div key={section.id}>
                    <p className="text-[12px] font-medium text-ink-muted">{section.title}</p>
                    <p className="mt-0.5 whitespace-pre-wrap text-[13px] text-ink">{value}</p>
                  </div>
                );
              })}
            </PanelBody>
          </Panel>
          <div className="mt-4">
            <CaseMaterial
              clinicalCase={clinicalCase}
              viewedScenarioIds={exercise.scenariosViewed}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
