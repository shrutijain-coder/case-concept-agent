import "server-only";

import { redirect } from "next/navigation";

import { getRepository } from "@/lib/db";
import type { Exercise, User } from "@/lib/db/types";

import { getCurrentUser } from "./session";

/** Signed-in user or a redirect to login. Use at the top of every app page. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Signed-in, and past the first-use safety notice. Everything inside the
 * practice flow uses this so the notice cannot be skipped by URL.
 */
export async function requireAcknowledgedUser(): Promise<User> {
  const user = await requireUser();
  if (!user.safetyAckAt) redirect("/safety-notice");
  return user;
}

/**
 * Loads an exercise and proves the caller owns it. Server-side ownership
 * check — the URL carries the id, so this is the only thing standing between
 * a guessed id and someone else's practice record.
 */
export async function requireOwnedExercise(
  exerciseId: string,
): Promise<{ user: User; exercise: Exercise }> {
  const user = await requireAcknowledgedUser();
  const exercise = await getRepository().getExercise(exerciseId);
  if (!exercise || exercise.userId !== user.id) redirect("/dashboard");
  return { user, exercise };
}
