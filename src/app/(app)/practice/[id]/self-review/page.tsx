import { redirect } from "next/navigation";

import { PromptAnswerForm } from "@/components/prompt-answer-form";
import { Badge, Notice, Panel, PanelBody, PanelHeader } from "@/components/ui";
import { requireOwnedExercise } from "@/lib/auth/guard";
import { getTemplate } from "@/lib/content/templates";
import { SELF_REVIEW_PROMPTS } from "@/lib/content/prompts";
import { getRepository } from "@/lib/db";
import { reopenCriticalThinkingAction, saveSelfReviewAction } from "@/lib/practice/actions";

/** Screen 10 — self-review, then the private-or-share decision. */
export default async function SelfReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { exercise } = await requireOwnedExercise(id);
  if (!exercise.modalityId || !exercise.currentVersionId) {
    redirect(`/practice/${exercise.id}/conceptualisation`);
  }

  const repo = getRepository();
  const template = getTemplate(exercise.modalityId);
  const version = await repo.getVersion(exercise.currentVersionId);
  const interactions = await repo.listInteractionsForExercise(exercise.id);
  const answered = interactions.filter((interaction) => interaction.userResponse !== null);
  const responses = version?.sectionResponses ?? exercise.draft;

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Your conceptualisation"
          description={`Version ${version?.versionNumber ?? 1} · ${answered.length} question${answered.length === 1 ? "" : "s"} answered`}
          action={<Badge tone="brand">{template.name}</Badge>}
        />
        <PanelBody className="space-y-3">
          {template.sections.map((section) => {
            const value = (responses[section.id] ?? "").trim();
            if (!value) return null;
            return (
              <div key={section.id}>
                <p className="text-[12px] font-medium text-ink-muted">{section.title}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{value}</p>
              </div>
            );
          })}
        </PanelBody>
      </Panel>

      <PromptAnswerForm
        exerciseId={exercise.id}
        title="Review your own reasoning"
        description="Nobody scores this. It is here because noticing where you are less certain is the skill."
        prompts={SELF_REVIEW_PROMPTS}
        initialAnswers={exercise.selfReview}
        action={saveSelfReviewAction}
        submitLabel="Save and continue to reflection"
        pendingLabel="Saving…"
        secondaryAction={{
          label: "Back to the questions",
          pendingLabel: "Opening…",
          action: reopenCriticalThinkingAction,
        }}
      >
        <Panel>
          <PanelHeader
            title="Share with peers?"
            description="Optional. Sharing is not required to complete a case."
          />
          <PanelBody className="space-y-3">
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 text-sm">
                <input
                  type="radio"
                  name="sharing"
                  value="private"
                  defaultChecked={exercise.sharing !== "group"}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-ink">Keep private</span>
                  <span className="block text-[13px] text-ink-muted">
                    Only you will ever see this.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-sm">
                <input
                  type="radio"
                  name="sharing"
                  value="group"
                  defaultChecked={exercise.sharing === "group"}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-ink">Share with my peer group</span>
                  <span className="block text-[13px] text-ink-muted">
                    Recorded now; visible to a group once peer learning ships.
                  </span>
                </span>
              </label>
            </div>

            <Notice>
              <p>
                Peer feedback is a <strong>peer perspective</strong>, not supervision and not
                expert review. Shared work is only ever visible to a group you choose — never
                publicly.
              </p>
            </Notice>
          </PanelBody>
        </Panel>
      </PromptAnswerForm>
    </div>
  );
}
