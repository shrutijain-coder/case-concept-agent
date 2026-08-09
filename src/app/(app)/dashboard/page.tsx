import Link from "next/link";

import { SubmitButton } from "@/components/submit-button";
import {
  Badge,
  EmptyState,
  Panel,
  PanelHeader,
} from "@/components/ui";
import { requireAcknowledgedUser } from "@/lib/auth/guard";
import { CASES } from "@/lib/content/cases";
import { getRepository } from "@/lib/db";
import { continueExerciseAction, startCaseAction } from "@/lib/practice/actions";
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
  const openByCase = new Map(inProgress.map((exercise) => [exercise.caseId, exercise]));

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          {counts.completed} completed &middot; {counts.inProgress} in progress
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 space-y-6">
          {inProgress.length ? (
            <Panel>
              <PanelHeader
                title="Continue practising"
                description="Cases you have started but not finished."
              />
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
            </Panel>
          ) : null}

          <div>
            <h2>Practise a case</h2>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Every case here is hypothetical and written for practice. None describes a real
              person.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CASES.map((clinicalCase) => {
              const open = openByCase.get(clinicalCase.id);
              return (
                <Panel key={clinicalCase.id} className="flex flex-col justify-between p-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge>{clinicalCase.difficulty}</Badge>
                      {clinicalCase.availableModalities.map((modality) => (
                        <Badge key={modality} tone="brand">
                          {modality.toUpperCase()}
                        </Badge>
                      ))}
                      {open ? <Badge tone="caution">In progress</Badge> : null}
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-ink">{clinicalCase.title}</h3>
                      <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
                        {clinicalCase.description}
                      </p>
                    </div>

                    <p className="text-[13px] text-ink-subtle pt-1">
                      {clinicalCase.themes.join(" · ")} &middot; about{" "}
                      {clinicalCase.estimatedMinutes} mins
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-line flex items-center justify-end">
                    <form action={startCaseAction} className="w-full">
                      <input type="hidden" name="caseId" value={clinicalCase.id} />
                      <SubmitButton
                        variant={open ? "secondary" : "primary"}
                        size="sm"
                        className="w-full"
                        pendingLabel="Opening…"
                      >
                        {open ? "Continue" : "Start case"}
                      </SubmitButton>
                    </form>
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8">
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
                  <li key={exercise.id} className="border-b border-line px-5 py-3 last:border-b-0">
                    <Link
                      href={`/practice/${exercise.id}/complete`}
                      className="text-sm text-ink hover:underline"
                    >
                      {caseTitle(exercise)}
                    </Link>
                    <p className="mt-0.5 text-[13px] text-ink-muted" suppressHydrationWarning>
                      {modalityLabel(exercise)} &middot; completed{" "}
                      {formatDate(exercise.completedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No completed cases yet">
                Completed exercises appear here.
              </EmptyState>
            )}
          </Panel>

          <Panel>
            <PanelHeader
              title="Peer activity"
              description="Feedback on conceptualisations you have shared."
            />
            <EmptyState title="No peer activity">
              Peer groups and free-form feedback are the next milestone. Sharing at the
              self-review step is recorded but not yet visible to anyone else.
            </EmptyState>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
