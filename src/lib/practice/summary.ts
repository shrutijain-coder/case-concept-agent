import { getCase } from "@/lib/content/cases";
import type { Exercise, ExerciseStage } from "@/lib/db/types";

const STAGE_LABELS: Record<ExerciseStage, string> = {
  vignette: "Reading the vignette",
  scenarios: "Working through scenarios",
  modality: "Choosing a framework",
  conceptualisation: "Writing the conceptualisation",
  critical_thinking: "Answering questions",
  self_review: "Self-review",
  reflection: "Reflection",
  complete: "Complete",
};

/** Ordered list of stages, used for the progress readout. */
const STAGE_ORDER: ExerciseStage[] = [
  "vignette",
  "scenarios",
  "modality",
  "conceptualisation",
  "critical_thinking",
  "self_review",
  "reflection",
  "complete",
];

export function stageLabel(stage: ExerciseStage): string {
  return STAGE_LABELS[stage];
}

export function stageIndex(stage: ExerciseStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export const TOTAL_STAGES = STAGE_ORDER.length - 1;

export function caseTitle(exercise: Exercise): string {
  return getCase(exercise.caseId)?.title ?? exercise.caseId;
}

export function modalityLabel(exercise: Exercise): string {
  if (!exercise.modalityId) return "Not chosen yet";
  return exercise.modalityId.toUpperCase();
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
