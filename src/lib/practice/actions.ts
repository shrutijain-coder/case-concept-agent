"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { generateQuestion } from "@/lib/ai/generate";
import { track } from "@/lib/analytics";
import { requireAcknowledgedUser, requireOwnedExercise } from "@/lib/auth/guard";
import { requireCase } from "@/lib/content/cases";
import { REFLECTION_PROMPTS, SELF_REVIEW_PROMPTS } from "@/lib/content/prompts";
import { getTemplate, isModalityId, missingRequiredSections } from "@/lib/content/templates";
import { getRepository } from "@/lib/db";
import type { Exercise, UserAction } from "@/lib/db/types";

import { stagePath } from "./stage-path";

export interface ActionState {
  error?: string;
  notice?: string;
}

function collectAnswers(
  formData: FormData,
  prompts: { id: string }[],
): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const prompt of prompts) {
    answers[prompt.id] = String(formData.get(prompt.id) ?? "").trim();
  }
  return answers;
}

// --- starting a case --------------------------------------------------------

export async function startCaseAction(formData: FormData): Promise<void> {
  const user = await requireAcknowledgedUser();
  const caseId = String(formData.get("caseId") ?? "");
  const clinicalCase = requireCase(caseId);

  const repo = getRepository();
  const existing = await repo.findOpenExerciseForCase(user.id, caseId);
  if (existing) redirect(stagePath(existing));

  const exercise = await repo.createExercise({
    userId: user.id,
    caseId: clinicalCase.id,
    caseVersion: clinicalCase.version,
  });
  await track("case_started", user.id, { caseId: clinicalCase.id });
  redirect(`/practice/${exercise.id}/vignette`);
}

export async function continueExerciseAction(formData: FormData): Promise<void> {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  const { exercise } = await requireOwnedExercise(exerciseId);
  redirect(stagePath(exercise));
}

// --- case material ----------------------------------------------------------

export async function goToScenariosAction(formData: FormData): Promise<void> {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  const { exercise } = await requireOwnedExercise(exerciseId);
  const clinicalCase = requireCase(exercise.caseId);

  // A case with no scenarios skips straight past the stage.
  const nextStage = clinicalCase.scenarios.length ? "scenarios" : "modality";
  if (exercise.stage === "vignette") {
    await getRepository().updateExercise(exercise.id, { stage: nextStage });
  }
  redirect(`/practice/${exercise.id}/${nextStage === "scenarios" ? "scenarios" : "modality"}`);
}

export async function markScenarioViewedAction(
  exerciseId: string,
  scenarioId: string,
): Promise<void> {
  const { user, exercise } = await requireOwnedExercise(exerciseId);
  if (exercise.scenariosViewed.includes(scenarioId)) return;

  await getRepository().updateExercise(exercise.id, {
    scenariosViewed: [...exercise.scenariosViewed, scenarioId],
  });
  await track("scenario_viewed", user.id, { caseId: exercise.caseId, scenarioId });
  revalidatePath(`/practice/${exercise.id}/scenarios`);
}

export async function goToModalityAction(formData: FormData): Promise<void> {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  const { exercise } = await requireOwnedExercise(exerciseId);
  if (exercise.stage === "scenarios") {
    await getRepository().updateExercise(exercise.id, { stage: "modality" });
  }
  redirect(`/practice/${exercise.id}/modality`);
}

// --- modality ---------------------------------------------------------------

export async function selectModalityAction(formData: FormData): Promise<void> {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  const modality = formData.get("modality");
  const { user, exercise } = await requireOwnedExercise(exerciseId);

  if (!isModalityId(modality)) redirect(`/practice/${exercise.id}/modality`);
  const template = getTemplate(modality);

  // Changing modality mid-exercise would orphan the existing draft, so the
  // draft is only cleared when the modality actually changes.
  const modalityChanged = exercise.modalityId !== null && exercise.modalityId !== modality;

  await getRepository().updateExercise(exercise.id, {
    modalityId: modality,
    templateVersion: template.version,
    stage: "conceptualisation",
    ...(modalityChanged ? { draft: {} } : {}),
  });
  await track("modality_selected", user.id, { caseId: exercise.caseId, modality });
  await track("conceptualisation_started", user.id, { caseId: exercise.caseId, modality });
  redirect(`/practice/${exercise.id}/conceptualisation`);
}

// --- conceptualisation ------------------------------------------------------

/** Autosave. Returns the save timestamp so the UI can show save state. */
export async function autosaveDraftAction(
  exerciseId: string,
  draft: Record<string, string>,
): Promise<{ savedAt: string }> {
  const { exercise } = await requireOwnedExercise(exerciseId);
  const updated = await getRepository().updateExercise(exercise.id, { draft });
  return { savedAt: updated.updatedAt };
}

export async function submitConceptualisationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  const { user, exercise } = await requireOwnedExercise(exerciseId);
  if (!exercise.modalityId) redirect(`/practice/${exercise.id}/modality`);

  const template = getTemplate(exercise.modalityId);
  const draft: Record<string, string> = {};
  for (const section of template.sections) {
    draft[section.id] = String(formData.get(section.id) ?? "").trim();
  }

  const missing = missingRequiredSections(template, draft);
  if (missing.length) {
    // Persist anyway — never lose typing because of a validation failure.
    await getRepository().updateExercise(exercise.id, { draft });
    return {
      error: `Before submitting, add something to: ${missing.map((s) => s.title).join(", ")}.`,
    };
  }

  const repo = getRepository();
  const isRevision = Boolean(exercise.submittedAt);
  const changeReason = isRevision
    ? String(formData.get("changeReason") ?? "").trim() || "Revised during critical thinking"
    : null;

  const version = await repo.createVersion({
    exerciseId: exercise.id,
    sectionResponses: draft,
    changeReason,
  });

  await repo.updateExercise(exercise.id, {
    draft,
    currentVersionId: version.id,
    stage: "critical_thinking",
    submittedAt: exercise.submittedAt ?? new Date().toISOString(),
  });

  await track(isRevision ? "conceptualisation_updated" : "conceptualisation_submitted", user.id, {
    caseId: exercise.caseId,
    modality: exercise.modalityId,
    versionNumber: version.versionNumber,
  });

  redirect(`/practice/${exercise.id}/critical-thinking`);
}

// --- critical thinking ------------------------------------------------------

/**
 * Generates and stores the next question for an exercise.
 *
 * Shared by "ask the first question" and by answering with Continue, so that
 * continuing is a single click rather than answer-then-request.
 */
async function produceNextQuestion(
  exercise: Exercise,
  userId: string,
): Promise<void> {
  if (!exercise.modalityId || !exercise.currentVersionId) return;

  const repo = getRepository();
  const session =
    (await repo.getActiveCtSession(exercise.id)) ?? (await repo.createCtSession(exercise.id));

  // Scoped to the whole exercise, not just the active session — ending a
  // session (via "I'm done") and reopening it starts a new session row, and
  // the AI (and the "earlier questions" list) must not forget everything
  // asked before that boundary.
  const allInteractions = await repo.listInteractionsForExercise(exercise.id);
  if (allInteractions.length === 0) {
    await track("critical_thinking_started", userId, { caseId: exercise.caseId });
  }

  // If the newest question overall is still unanswered, don't stack another
  // on top of it.
  const last = allInteractions.at(-1);
  if (last && last.userResponse === null) return;

  const clinicalCase = requireCase(exercise.caseId);
  const template = getTemplate(exercise.modalityId);
  const version = await repo.getVersion(exercise.currentVersionId);

  const result = await generateQuestion(
    {
      clinicalCase,
      template,
      scenariosViewed: exercise.scenariosViewed,
      responses: version?.sectionResponses ?? exercise.draft,
      previousInteractions: allInteractions,
      revisedSinceLastQuestion:
        last?.userAction === "UPDATE_CONCEPTUALISATION" &&
        last.conceptualisationVersionId !== exercise.currentVersionId,
    },
    userId,
  );

  await repo.createInteraction({
    sessionId: session.id,
    question: result.question,
    category: result.category,
    source: result.source,
    targetSection: result.targetSection,
    conceptualisationVersionId: exercise.currentVersionId,
  });

  await track("question_generated", userId, {
    caseId: exercise.caseId,
    category: result.category,
    source: result.source,
  });
}

export async function nextQuestionAction(formData: FormData): Promise<void> {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  const { user, exercise } = await requireOwnedExercise(exerciseId);
  if (!exercise.modalityId || !exercise.currentVersionId) {
    redirect(`/practice/${exercise.id}/conceptualisation`);
  }
  await produceNextQuestion(exercise, user.id);
  revalidatePath(`/practice/${exercise.id}/critical-thinking`);
}

const answerSchema = z.object({
  interactionId: z.string().min(1),
  response: z.string().trim().min(1, "Write a response before continuing."),
  action: z.enum(["UPDATE_CONCEPTUALISATION", "CONTINUE", "END_SESSION"]),
});

export async function answerQuestionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  const { user, exercise } = await requireOwnedExercise(exerciseId);

  const parsed = answerSchema.safeParse({
    interactionId: formData.get("interactionId"),
    response: formData.get("response"),
    action: formData.get("action"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Write a response before continuing." };
  }

  const repo = getRepository();
  const session = await repo.getActiveCtSession(exercise.id);
  if (!session) redirect(`/practice/${exercise.id}/conceptualisation`);

  // The interaction must belong to this exercise's session.
  const interactions = await repo.listInteractions(session.id);
  if (!interactions.some((i) => i.id === parsed.data.interactionId)) {
    return { error: "That question is no longer active. Reload the page." };
  }

  const action = parsed.data.action as UserAction;
  await repo.answerInteraction(parsed.data.interactionId, parsed.data.response, action);
  await track("question_answered", user.id, { caseId: exercise.caseId, action });

  if (action === "UPDATE_CONCEPTUALISATION") {
    await repo.updateExercise(exercise.id, { stage: "conceptualisation" });
    redirect(`/practice/${exercise.id}/conceptualisation`);
  }

  if (action === "END_SESSION") {
    await repo.completeCtSession(session.id);
    await repo.updateExercise(exercise.id, { stage: "self_review" });
    await track("critical_thinking_completed", user.id, {
      caseId: exercise.caseId,
      questions: interactions.length,
    });
    redirect(`/practice/${exercise.id}/self-review`);
  }

  // Continue: produce the next question in the same round trip.
  await produceNextQuestion(exercise, user.id);
  revalidatePath(`/practice/${exercise.id}/critical-thinking`);
  return {};
}

// --- self review, sharing, reflection ---------------------------------------

export async function saveSelfReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  const { user, exercise } = await requireOwnedExercise(exerciseId);

  const answers = collectAnswers(formData, SELF_REVIEW_PROMPTS);
  const missing = SELF_REVIEW_PROMPTS.filter((p) => p.required && !answers[p.id]);
  if (missing.length) {
    await getRepository().updateExercise(exercise.id, { selfReview: answers });
    return { error: "Answer the questions marked required before continuing." };
  }

  const sharing = formData.get("sharing") === "group" ? "group" : "private";
  await getRepository().updateExercise(exercise.id, {
    selfReview: answers,
    sharing,
    stage: "reflection",
  });
  await track("self_review_completed", user.id, { caseId: exercise.caseId, sharing });
  redirect(`/practice/${exercise.id}/reflection`);
}

export async function saveReflectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  const { user, exercise } = await requireOwnedExercise(exerciseId);

  const answers = collectAnswers(formData, REFLECTION_PROMPTS);
  const missing = REFLECTION_PROMPTS.filter((p) => p.required && !answers[p.id]);
  if (missing.length) {
    await getRepository().updateExercise(exercise.id, { reflection: answers });
    return { error: "Answer the questions marked required before marking this complete." };
  }

  const completedAt = new Date().toISOString();
  await getRepository().updateExercise(exercise.id, {
    reflection: answers,
    stage: "complete",
    status: "complete",
    completedAt,
  });

  await track("reflection_completed", user.id, { caseId: exercise.caseId });
  await track("case_completed", user.id, { caseId: exercise.caseId });
  await track("learning_record_completed", user.id, {
    caseId: exercise.caseId,
    modality: exercise.modalityId,
  });

  redirect(`/practice/${exercise.id}/complete`);
}

/** Used by the "back to the questions" control on self-review. */
export async function reopenCriticalThinkingAction(formData: FormData): Promise<void> {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  const { exercise } = await requireOwnedExercise(exerciseId);
  const repo = getRepository();
  if (!(await repo.getActiveCtSession(exercise.id))) {
    await repo.createCtSession(exercise.id);
  }
  await repo.updateExercise(exercise.id, { stage: "critical_thinking" });
  redirect(`/practice/${exercise.id}/critical-thinking`);
}
