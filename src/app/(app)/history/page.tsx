import Link from "next/link";

import { Badge, ButtonLink, EmptyState, Panel, PanelHeader } from "@/components/ui";
import { requireAcknowledgedUser } from "@/lib/auth/guard";
import { getRepository } from "@/lib/db";
import { stagePath } from "@/lib/practice/stage-path";
import { caseTitle, formatDate, modalityLabel, stageLabel } from "@/lib/practice/summary";

/**
 * Screen 13 — learning history. Deliberately no competency score anywhere:
 * what is shown is what happened, not a judgement about it.
 */
export default async function HistoryPage() {
  const user = await requireAcknowledgedUser();
  const repo = getRepository();
  const exercises = await repo.listExercises(user.id);

  const versionCounts = new Map<string, number>();
  await Promise.all(
    exercises.map(async (exercise) => {
      const versions = await repo.listVersions(exercise.id);
      versionCounts.set(exercise.id, versions.length);
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>Practice history</h1>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          Everything you have worked on, in order of most recent activity.
        </p>
      </div>

      <Panel>
        <PanelHeader title={`${exercises.length} exercise${exercises.length === 1 ? "" : "s"}`} />

        {exercises.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[13px] text-ink-muted">
                  <th className="px-5 py-2.5 font-medium">Case</th>
                  <th className="px-5 py-2.5 font-medium">Framework</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Versions</th>
                  <th className="px-5 py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => {
                  const versions = versionCounts.get(exercise.id) ?? 0;
                  const complete = exercise.status === "complete";
                  return (
                    <tr
                      key={exercise.id}
                      className="border-b border-line transition-colors duration-150 last:border-b-0 hover:bg-sunken"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={complete ? `/practice/${exercise.id}/complete` : stagePath(exercise)}
                          className="font-medium text-ink hover:underline"
                        >
                          {caseTitle(exercise)}
                        </Link>
                        {exercise.sharing === "group" ? (
                          <span className="ml-2 align-middle">
                            <Badge>Shared</Badge>
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-ink-muted">{modalityLabel(exercise)}</td>
                      <td className="px-5 py-3 text-ink-muted">
                        {complete ? "Complete" : stageLabel(exercise.stage)}
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        {versions === 0
                          ? "—"
                          : versions === 1
                            ? "1 (not revised)"
                            : `${versions} (revised)`}
                      </td>
                      <td className="px-5 py-3 text-ink-muted">
                        {formatDate(exercise.completedAt ?? exercise.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No practice yet"
            action={
              <ButtonLink href="/dashboard" variant="secondary" size="sm">
                Browse cases
              </ButtonLink>
            }
          >
            Once you complete a case it will appear here with its conceptualisation
            versions and your reflection.
          </EmptyState>
        )}
      </Panel>
    </div>
  );
}
