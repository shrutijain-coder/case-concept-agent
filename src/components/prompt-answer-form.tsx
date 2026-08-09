"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Field, FormError, Panel, PanelBody, PanelHeader, Textarea } from "@/components/ui";
import type { WrittenPrompt } from "@/lib/content/prompts";
import type { ActionState } from "@/lib/practice/actions";
import type { ReactNode } from "react";

/**
 * Shared form for the self-review and reflection stages — a list of written
 * prompts plus whatever extra controls that stage needs.
 */
export function PromptAnswerForm({
  exerciseId,
  title,
  description,
  prompts,
  initialAnswers,
  action,
  submitLabel,
  pendingLabel,
  children,
  secondaryAction,
}: {
  exerciseId: string;
  title: string;
  description?: string;
  prompts: WrittenPrompt[];
  initialAnswers: Record<string, string>;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  pendingLabel: string;
  /** Extra fields rendered inside the form, above the submit row. */
  children?: ReactNode;
  /**
   * A second server action offered alongside the main submit — e.g. "back to
   * the questions" next to "save and continue". Rendered as a second submit
   * button using the button-level `formAction` override, not a nested
   * <form>: nested forms are invalid HTML and browsers resolve which one
   * actually receives the click inconsistently.
   */
  secondaryAction?: {
    label: ReactNode;
    pendingLabel?: string;
    action: (formData: FormData) => Promise<void>;
  };
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="exerciseId" value={exerciseId} />

      <Panel>
        <PanelHeader title={title} description={description} />
        <PanelBody className="space-y-5">
          {prompts.map((prompt) => (
            <Field
              key={prompt.id}
              htmlFor={prompt.id}
              label={
                <span>
                  {prompt.question}
                  {prompt.required ? null : (
                    <span className="ml-1.5 font-normal text-ink-subtle">optional</span>
                  )}
                </span>
              }
              hint={prompt.hint}
            >
              <Textarea
                id={prompt.id}
                name={prompt.id}
                rows={3}
                defaultValue={initialAnswers[prompt.id] ?? ""}
              />
            </Field>
          ))}
        </PanelBody>
      </Panel>

      {children}

      <FormError>{state.error}</FormError>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
        {secondaryAction ? (
          <SubmitButton
            variant="ghost"
            formAction={secondaryAction.action}
            pendingLabel={secondaryAction.pendingLabel}
          >
            {secondaryAction.label}
          </SubmitButton>
        ) : null}
      </div>
    </form>
  );
}
