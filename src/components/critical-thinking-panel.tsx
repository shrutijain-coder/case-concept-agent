"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { FormError, Panel, PanelBody, PanelHeader, Textarea } from "@/components/ui";
import { answerQuestionAction, type ActionState } from "@/lib/practice/actions";
import type { QuestionInteraction } from "@/lib/db/types";

/**
 * Screen 9 — one question at a time.
 *
 * After answering, the therapist chooses: update the conceptualisation,
 * continue with the questions, or stop. The therapist decides when the
 * session ends; there is no minimum to grind through.
 */
export function CriticalThinkingPanel({
  exerciseId,
  question,
  questionNumber,
  answeredCount,
}: {
  exerciseId: string;
  question: QuestionInteraction;
  /** Position across the whole exercise, not the per-session sequence. */
  questionNumber: number;
  answeredCount: number;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    answerQuestionAction,
    {},
  );

  return (
    <Panel>
      <PanelHeader
        title={`Question ${questionNumber}`}
        description={
          answeredCount === 0
            ? "Answer in as much or as little detail as you want."
            : `${answeredCount} answered so far.`
        }
      />
      <PanelBody className="space-y-4">
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink">{question.question}</p>

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="exerciseId" value={exerciseId} />
          <input type="hidden" name="interactionId" value={question.id} />

          <Textarea
            name="response"
            rows={6}
            required
            aria-label="Your response"
            placeholder="Think it through here."
          />

          <FormError>{state.error}</FormError>

          <div className="border-t border-line pt-3">
            <p className="mb-2 text-[13px] text-ink-muted">
              Do you want to update the conceptualisation or continue with the questions?
            </p>
            <div className="flex flex-wrap gap-2">
              <SubmitButton
                name="action"
                value="CONTINUE"
                pendingLabel="Thinking through your next question…"
              >
                Continue with questions
              </SubmitButton>
              <SubmitButton
                name="action"
                value="UPDATE_CONCEPTUALISATION"
                variant="secondary"
                pendingLabel="Opening…"
              >
                Update my conceptualisation
              </SubmitButton>
              <SubmitButton
                name="action"
                value="END_SESSION"
                variant="ghost"
                pendingLabel="Finishing…"
              >
                I&rsquo;m done
              </SubmitButton>
            </div>
          </div>
        </form>
      </PanelBody>
    </Panel>
  );
}
