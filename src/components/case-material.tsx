import type { ClinicalCase } from "@/lib/content/cases";

/**
 * Re-readable case material. Collapsed by default so it can sit alongside the
 * conceptualisation and critical-thinking screens without taking the page
 * over — the PRD requires the vignette stays reachable throughout.
 */
export function CaseMaterial({
  clinicalCase,
  viewedScenarioIds,
  defaultOpen = false,
}: {
  clinicalCase: ClinicalCase;
  viewedScenarioIds: string[];
  defaultOpen?: boolean;
}) {
  const seen = new Set(viewedScenarioIds);
  const viewedScenarios = clinicalCase.scenarios.filter((s) => seen.has(s.id));

  return (
    <details
      open={defaultOpen}
      className="rounded-lg border border-line bg-surface [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="cursor-pointer list-none px-5 py-3 text-[13px] font-medium text-ink hover:bg-sunken">
        Case material — {clinicalCase.title}
        <span className="ml-2 font-normal text-ink-subtle">
          (hypothetical; open to re-read)
        </span>
      </summary>

      <div className="space-y-4 border-t border-line px-5 py-4">
        {clinicalCase.vignette.map((section) => (
          <div key={section.id}>
            <h3 className="mb-1">{section.title}</h3>
            <div className="prose-clinical text-sm text-ink-muted">
              {section.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}

        {viewedScenarios.length ? (
          <div className="border-t border-line pt-4">
            <h3 className="mb-2">Scenarios you have seen</h3>
            <div className="space-y-3">
              {viewedScenarios.map((scenario) => (
                <div key={scenario.id}>
                  <p className="text-[13px] font-medium text-ink">{scenario.title}</p>
                  <div className="mt-1 space-y-1">
                    {scenario.dialogue.map((line, index) => (
                      <p key={index} className="text-sm text-ink-muted">
                        <span className="font-medium text-ink">{line.speaker}:</span>{" "}
                        {line.text}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </details>
  );
}
