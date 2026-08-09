import { redirect } from "next/navigation";

import { PromptAnswerForm } from "@/components/prompt-answer-form";
import { Panel, PanelBody, PanelHeader } from "@/components/ui";
import { requireOwnedExercise } from "@/lib/auth/guard";
import { REFLECTION_PROMPTS } from "@/lib/content/prompts";
import { getTemplate } from "@/lib/content/templates";
import { getRepository } from "@/lib/db";
import { saveReflectionAction } from "@/lib/practice/actions";
import { formatDateTime } from "@/lib/practice/summary";

/** Screen 12 — final reflection. Completing it marks the case complete. */
export default async function ReflectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { exercise } = await requireOwnedExercise(id);
  if (!exercise.modalityId) redirect(`/practice/${exercise.id}/modality`);

  const template = getTemplate(exercise.modalityId);
  const versions = await getRepository().listVersions(exercise.id);

  return (
    <div className="space-y-4">
      {versions.length > 1 ? (
        <Panel>
          <PanelHeader
            title="What changed"
            description={`${versions.length} versions. The original is kept in full.`}
          />
          <PanelBody className="space-y-4">
            {template.sections.map((section) => {
              const first = (versions[0].sectionResponses[section.id] ?? "").trim();
              const last = (
                versions[versions.length - 1].sectionResponses[section.id] ?? ""
              ).trim();
              if (first === last) return null;
              return (
                <div key={section.id} className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-[12px] font-medium text-ink-muted">
                      {section.title} — version 1
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-[13px] text-ink-muted">
                      {first || "(left blank)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-ink">
                      {section.title} — version {versions.length}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-[13px] text-ink">
                      {last || "(left blank)"}
                    </p>
                  </div>
                </div>
              );
            })}

            {template.sections.every(
              (section) =>
                (versions[0].sectionResponses[section.id] ?? "").trim() ===
                (versions[versions.length - 1].sectionResponses[section.id] ?? "").trim(),
            ) ? (
              <p className="text-[13px] text-ink-muted">
                The wording did not change between versions.
              </p>
            ) : null}
          </PanelBody>
        </Panel>
      ) : (
        <Panel>
          <PanelHeader title="One version" />
          <PanelBody>
            <p className="text-[13px] text-ink-muted">
              You did not revise the conceptualisation during the questions. That is a
              legitimate outcome — the reflection below is still worth doing.
            </p>
            <p className="mt-1 text-[13px] text-ink-subtle">
              Submitted {formatDateTime(exercise.submittedAt)}.
            </p>
          </PanelBody>
        </Panel>
      )}

      <PromptAnswerForm
        exerciseId={exercise.id}
        title="Reflection"
        description="The last step. Completing it marks the case complete."
        prompts={REFLECTION_PROMPTS}
        initialAnswers={exercise.reflection}
        action={saveReflectionAction}
        submitLabel="Mark complete"
        pendingLabel="Saving…"
      />
    </div>
  );
}
