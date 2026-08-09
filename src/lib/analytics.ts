import "server-only";

import { getRepository } from "@/lib/db";

/**
 * Product events from the technical PRD's analytics list. Recorded to the
 * app's own store; a PostHog sink can be added alongside without touching
 * call sites.
 *
 * Instrumentation must never be able to fail a user action, so every write is
 * best-effort.
 */
export type EventName =
  | "account_created"
  | "case_started"
  | "case_completed"
  | "scenario_viewed"
  | "modality_selected"
  | "conceptualisation_started"
  | "conceptualisation_submitted"
  | "critical_thinking_started"
  | "question_generated"
  | "question_answered"
  | "conceptualisation_updated"
  | "critical_thinking_completed"
  | "self_review_completed"
  | "reflection_completed"
  | "learning_record_completed"
  | "ai_generation_failed"
  | "ai_output_rejected";

export async function track(
  name: EventName,
  userId: string | null,
  props: Record<string, unknown> = {},
): Promise<void> {
  try {
    await getRepository().recordEvent({ userId, name, props });
  } catch (error) {
    console.error(`[analytics] failed to record ${name}`, error);
  }
}
