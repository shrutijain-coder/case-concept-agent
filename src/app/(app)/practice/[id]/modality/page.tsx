import { SubmitButton } from "@/components/submit-button";
import { Notice, Panel, PanelBody } from "@/components/ui";
import { requireOwnedExercise } from "@/lib/auth/guard";
import { requireCase } from "@/lib/content/cases";
import { getTemplate } from "@/lib/content/templates";
import { selectModalityAction } from "@/lib/practice/actions";

/** Screen 7 — modality selection. Determines the template and steers the AI. */
export default async function ModalityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { exercise } = await requireOwnedExercise(id);
  const clinicalCase = requireCase(exercise.caseId);
  const available = clinicalCase.availableModalities;

  return (
    <div className="space-y-4">
      <div>
        <h2>Which framework would you like to use?</h2>
        <p className="mt-1 text-sm text-ink-muted">
          The conceptualisation template changes with your choice. Neither is the right
          answer for this case — they organise the same material differently.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {available.map((modalityId) => {
          const template = getTemplate(modalityId);
          const selected = exercise.modalityId === modalityId;
          return (
            <Panel key={modalityId}>
              <PanelBody className="flex h-full flex-col">
                <h3>{template.name}</h3>
                <p className="mt-1 text-[13px] text-ink-muted">{template.basis}</p>

                <div className="mt-3 border-t border-line pt-3">
                  <p className="text-[13px] font-medium text-ink">
                    {template.sections.length} fields
                  </p>
                  <ul className="mt-1.5 space-y-1 text-[13px] text-ink-muted">
                    {template.sections.slice(0, 5).map((section) => (
                      <li key={section.id}>{section.title}</li>
                    ))}
                    {template.sections.length > 5 ? (
                      <li className="text-ink-subtle">
                        and {template.sections.length - 5} more
                      </li>
                    ) : null}
                  </ul>
                </div>

                <form action={selectModalityAction} className="mt-4 pt-1">
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <input type="hidden" name="modality" value={modalityId} />
                  <SubmitButton
                    variant={selected ? "secondary" : "primary"}
                    size="sm"
                    pendingLabel="Loading template…"
                  >
                    {selected ? `Continue with ${template.name}` : `Use ${template.name}`}
                  </SubmitButton>
                </form>
              </PanelBody>
            </Panel>
          );
        })}
      </div>

      <Notice>
        <p>
          These are <strong>learning templates</strong>. They are one way of laying out a CBT
          or DBT formulation for practice — not a universal or definitive representation of
          either model.
        </p>
      </Notice>

      {exercise.modalityId && available.length > 1 ? (
        <p className="text-[13px] text-ink-muted">
          You already started with {exercise.modalityId.toUpperCase()}. Switching framework
          clears the draft, because the fields are different.
        </p>
      ) : null}
    </div>
  );
}
