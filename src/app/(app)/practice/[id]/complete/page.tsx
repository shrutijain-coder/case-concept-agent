import { redirect } from "next/navigation";

import {
  Badge,
  ButtonLink,
  DetailRow,
  Panel,
  PanelBody,
  PanelHeader,
} from "@/components/ui";
import { requireOwnedExercise } from "@/lib/auth/guard";
import { requireCase } from "@/lib/content/cases";
import { REFLECTION_PROMPTS, SELF_REVIEW_PROMPTS } from "@/lib/content/prompts";
import { getTemplate } from "@/lib/content/templates";
import { getRepository } from "@/lib/db";
import { formatDateTime } from "@/lib/practice/summary";

/**
 * The learning record. Reachable from history, so it doubles as the archive
 * view of a completed exercise.
 */
export default async function CompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { exercise } = await requireOwnedExercise(id);
  if (exercise.status !== "complete") redirect(`/practice/${exercise.id}/reflection`);
  if (!exercise.modalityId) redirect(`/practice/${exercise.id}/modality`);

  const repo = getRepository();
  const clinicalCase = requireCase(exercise.caseId);
  const template = getTemplate(exercise.modalityId);
  const versions = await repo.listVersions(exercise.id);
  const interactions = await repo.listInteractionsForExercise(exercise.id);
  const answered = interactions.filter((interaction) => interaction.userResponse !== null);
  const final = versions.at(-1);

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Case complete"
          action={<Badge tone="brand">{template.name}</Badge>}
        />
        <PanelBody>
          <dl>
            <DetailRow label="Case">
              {clinicalCase.title} (version {exercise.caseVersion})
            </DetailRow>
            <DetailRow label="Framework">{template.name}</DetailRow>
            <DetailRow label="Conceptualisation versions">
              {versions.length}
              {versions.length > 1 ? " — revised during the questions" : " — not revised"}
            </DetailRow>
            <DetailRow label="Questions answered">{answered.length}</DetailRow>
            <DetailRow label="Shared with peers">
              {exercise.sharing === "group" ? "Yes" : "No — kept private"}
            </DetailRow>
            <DetailRow label="Completed">{formatDateTime(exercise.completedAt)}</DetailRow>
          </dl>
        </PanelBody>
      </Panel>

      {final ? (
        <Panel>
          <PanelHeader title={`Final conceptualisation (version ${final.versionNumber})`} />
          <PanelBody className="space-y-3">
            {template.sections.map((section) => {
              const value = (final.sectionResponses[section.id] ?? "").trim();
              if (!value) return null;
              return (
                <div key={section.id}>
                  <p className="text-[12px] font-medium text-ink-muted">{section.title}</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{value}</p>
                </div>
              );
            })}
          </PanelBody>
        </Panel>
      ) : null}

      {versions.length > 1 ? (
        <Panel>
          <PanelHeader
            title="Version history"
            description="Earlier versions are kept so you can see how your thinking moved."
          />
          <ul>
            {versions.map((version) => (
              <li
                key={version.id}
                className="border-b border-line px-5 py-3 last:border-b-0"
              >
                <p className="text-[13px] font-medium text-ink">
                  Version {version.versionNumber}
                  <span className="ml-2 font-normal text-ink-subtle">
                    {formatDateTime(version.createdAt)}
                  </span>
                </p>
                {version.changeReason ? (
                  <p className="mt-0.5 text-[13px] text-ink-muted">{version.changeReason}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {answered.length ? (
        <Panel>
          <PanelHeader title="Critical-thinking responses" />
          <ul>
            {answered.map((interaction) => (
              <li
                key={interaction.id}
                className="border-b border-line px-5 py-3.5 last:border-b-0"
              >
                <p className="text-sm text-ink">{interaction.question}</p>
                <p className="mt-1.5 whitespace-pre-wrap text-[13px] text-ink-muted">
                  {interaction.userResponse}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeader title="Self-review" />
        <PanelBody className="space-y-3">
          {SELF_REVIEW_PROMPTS.map((prompt) => {
            const answer = (exercise.selfReview[prompt.id] ?? "").trim();
            if (!answer) return null;
            return (
              <div key={prompt.id}>
                <p className="text-[12px] font-medium text-ink-muted">{prompt.question}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{answer}</p>
              </div>
            );
          })}
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader title="Reflection" />
        <PanelBody className="space-y-3">
          {REFLECTION_PROMPTS.map((prompt) => {
            const answer = (exercise.reflection[prompt.id] ?? "").trim();
            if (!answer) return null;
            return (
              <div key={prompt.id}>
                <p className="text-[12px] font-medium text-ink-muted">{prompt.question}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{answer}</p>
              </div>
            );
          })}
        </PanelBody>
      </Panel>

      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/cases">Practise another case</ButtonLink>
        <ButtonLink href="/history" variant="secondary">
          Practice history
        </ButtonLink>
      </div>
    </div>
  );
}
