import Link from "next/link";

import { SubmitButton } from "@/components/submit-button";
import {
  Badge,
  Button,
  ButtonLink,
  EmptyState,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
  Select,
} from "@/components/ui";
import { requireAcknowledgedUser } from "@/lib/auth/guard";
import { CASES, CASE_THEMES, DIFFICULTIES, type ClinicalCase } from "@/lib/content/cases";
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

/**
 * Dashboard and case library merged into one screen: the case list is the
 * primary action on this app, so it lives on the landing page rather than
 * behind an extra click. `/cases` still resolves (it now redirects here,
 * carrying any filters) so old links and bookmarks keep working.
 */

interface SearchParams {
  q?: string;
  modality?: string;
  difficulty?: string;
  theme?: string;
}

function matches(clinicalCase: ClinicalCase, filters: SearchParams): boolean {
  const query = filters.q?.trim().toLowerCase();
  if (query) {
    const haystack = [clinicalCase.title, clinicalCase.description, ...clinicalCase.themes]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (
    filters.modality &&
    !clinicalCase.availableModalities.includes(filters.modality as "cbt" | "dbt")
  ) {
    return false;
  }
  if (filters.difficulty && clinicalCase.difficulty !== filters.difficulty) return false;
  if (filters.theme && !clinicalCase.themes.includes(filters.theme)) return false;
  return true;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireAcknowledgedUser();
  const filters = await searchParams;
  const repo = getRepository();
  const [exercises, counts] = await Promise.all([
    repo.listExercises(user.id),
    repo.countPractice(user.id),
  ]);

  const inProgress = exercises.filter((e) => e.status === "in_progress");
  const recent = exercises.filter((e) => e.status === "complete").slice(0, 5);
  const openByCase = new Map(inProgress.map((exercise) => [exercise.caseId, exercise]));

  const results = CASES.filter((clinicalCase) => matches(clinicalCase, filters));
  const hasFilters = Boolean(filters.q || filters.modality || filters.difficulty || filters.theme);

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

          <Panel>
            <PanelBody>
              <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
                <div className="lg:col-span-2">
                  <label htmlFor="q" className="mb-1.5 block text-[13px] font-medium text-ink">
                    Search
                  </label>
                  <Input
                    id="q"
                    name="q"
                    defaultValue={filters.q ?? ""}
                    placeholder="Title, description, or theme"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modality"
                    className="mb-1.5 block text-[13px] font-medium text-ink"
                  >
                    Modality
                  </label>
                  <Select id="modality" name="modality" defaultValue={filters.modality ?? ""}>
                    <option value="">Any</option>
                    <option value="cbt">CBT</option>
                    <option value="dbt">DBT</option>
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor="difficulty"
                    className="mb-1.5 block text-[13px] font-medium text-ink"
                  >
                    Difficulty
                  </label>
                  <Select id="difficulty" name="difficulty" defaultValue={filters.difficulty ?? ""}>
                    <option value="">Any</option>
                    {DIFFICULTIES.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor="theme" className="mb-1.5 block text-[13px] font-medium text-ink">
                    Theme
                  </label>
                  <Select id="theme" name="theme" defaultValue={filters.theme ?? ""}>
                    <option value="">Any</option>
                    {CASE_THEMES.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
                  <Button type="submit" variant="secondary" size="sm">
                    Apply filters
                  </Button>
                  {hasFilters ? (
                    <ButtonLink href="/dashboard" variant="ghost" size="sm">
                      Clear
                    </ButtonLink>
                  ) : null}
                </div>
              </form>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader
              title={`${results.length} case${results.length === 1 ? "" : "s"}`}
              description="A case can be conceptualised more than once, using a different framework."
            />

            {results.length ? (
              <ul>
                {results.map((clinicalCase) => {
                  const open = openByCase.get(clinicalCase.id);
                  return (
                    <li
                      key={clinicalCase.id}
                      className="border-b border-line px-5 py-4 last:border-b-0"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3>{clinicalCase.title}</h3>
                            <Badge>{clinicalCase.difficulty}</Badge>
                            {clinicalCase.availableModalities.map((modality) => (
                              <Badge key={modality} tone="brand">
                                {modality.toUpperCase()}
                              </Badge>
                            ))}
                            {open ? <Badge tone="caution">In progress</Badge> : null}
                          </div>

                          <p className="mt-1.5 text-sm text-ink-muted">
                            {clinicalCase.description}
                          </p>

                          <p className="mt-1.5 text-[13px] text-ink-subtle">
                            {clinicalCase.themes.join(" · ")} &middot; about{" "}
                            {clinicalCase.estimatedMinutes} minutes
                          </p>
                        </div>

                        <form action={startCaseAction} className="shrink-0">
                          <input type="hidden" name="caseId" value={clinicalCase.id} />
                          <SubmitButton
                            variant={open ? "secondary" : "primary"}
                            size="sm"
                            pendingLabel="Opening…"
                          >
                            {open ? "Continue" : "Start case"}
                          </SubmitButton>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                title="No cases match those filters"
                action={
                  <ButtonLink href="/dashboard" variant="secondary" size="sm">
                    Clear filters
                  </ButtonLink>
                }
              >
                Try widening the search or removing a filter.
              </EmptyState>
            )}
          </Panel>
        </div>

        <aside className="space-y-6">
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
                    <p className="mt-0.5 text-[13px] text-ink-muted">
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
