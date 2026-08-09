import Link from "next/link";

import { SubmitButton } from "@/components/submit-button";
import { ButtonLink, EmptyState, Panel, PanelHeader } from "@/components/ui";
import { requireAcknowledgedUser } from "@/lib/auth/guard";
import { getRepository } from "@/lib/db";
import { continueExerciseAction } from "@/lib/practice/actions";
import { stagePath } from "@/lib/practice/stage-path";
import {
  caseTitle,
  formatDate,
  modalityLabel,
  stageIndex,
  stageLabel,
  TOTAL_STAGES,
} from "@/lib/practice/summary";

export default async function DashboardPage() {
  const user = await requireAcknowledgedUser();
  const repo = getRepository();
  const [exercises, counts] = await Promise.all([
    repo.listExercises(user.id),
    repo.countPractice(user.id),
  ]);

  const inProgress = exercises.filter((e) => e.status === "in_progress");
  const recent = exercises.filter((e) => e.status === "complete").slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            {counts.completed} completed &middot; {counts.inProgress} in progress
          </p>
        </div>
        <ButtonLink href="/cases">Practise a case</ButtonLink>
      </div>

      <Panel>
        <PanelHeader
          title="Continue practising"
          description="Cases you have started but not finished."
        />
        {inProgress.length ? (
          <ul>
            {inProgress.map((exercise) => (
              <li
                key={exercise.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <Link
                    href={stagePath(exercise)}
                    className="text-sm font-medium text-ink hover:underline"
                  >
                    {caseTitle(exercise)}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    {stageLabel(exercise.stage)} &middot; step{" "}
                    {stageIndex(exercise.stage) + 1} of {TOTAL_STAGES} &middot;{" "}
                    {modalityLabel(exercise)}
                  </p>
                </div>
                <form action={continueExerciseAction}>
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <SubmitButton variant="secondary" size="sm" pendingLabel="Opening…">
                    Continue
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nothing in progress"
            action={
              <ButtonLink href="/cases" variant="secondary" size="sm">
                Browse cases
              </ButtonLink>
            }
          >
            Pick a case from the library to start a new conceptualisation.
          </EmptyState>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Recent practice"
          action={
            recent.length ? (
              <Link href="/history" className="text-[13px] text-brand hover:underline">
                All history
              </Link>
            ) : null
          }
        />
        {recent.length ? (
          <ul>
            {recent.map((exercise) => (
              <li
                key={exercise.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/practice/${exercise.id}/complete`}
                    className="text-sm text-ink hover:underline"
                  >
                    {caseTitle(exercise)}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    {modalityLabel(exercise)} &middot; completed{" "}
                    {formatDate(exercise.completedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No completed cases yet">
            Completed exercises appear here, with the conceptualisation, the questions you
            answered, and your reflection.
          </EmptyState>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Peer activity"
          description="Feedback on conceptualisations you have shared."
        />
        <EmptyState title="No peer activity">
          Peer groups and free-form feedback are the next milestone. Until then, sharing at
          the self-review step is recorded but not yet visible to anyone else.
        </EmptyState>
      </Panel>
    </div>
  );
}
