import type { Exercise } from "@/lib/db/types";

/**
 * Where a given stage lives, so "continue" always lands in the right place.
 *
 * Lives outside actions.ts because a "use server" module may only export
 * async functions.
 */
export function stagePath(exercise: Exercise): string {
  const base = `/practice/${exercise.id}`;
  switch (exercise.stage) {
    case "vignette":
      return `${base}/vignette`;
    case "scenarios":
      return `${base}/scenarios`;
    case "modality":
      return `${base}/modality`;
    case "conceptualisation":
      return `${base}/conceptualisation`;
    case "critical_thinking":
      return `${base}/critical-thinking`;
    case "self_review":
      return `${base}/self-review`;
    case "reflection":
      return `${base}/reflection`;
    case "complete":
      return `${base}/complete`;
  }
}
