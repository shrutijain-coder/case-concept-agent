import { redirect } from "next/navigation";

import { requireOwnedExercise } from "@/lib/auth/guard";
import { stagePath } from "@/lib/practice/stage-path";

/** Bare /practice/[id] lands on whichever stage the exercise is actually at. */
export default async function PracticeIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { exercise } = await requireOwnedExercise(id);
  redirect(stagePath(exercise));
}
