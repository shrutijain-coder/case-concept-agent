"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Field, FormError, Notice, Panel, PanelBody, PanelHeader, Textarea } from "@/components/ui";
import type { ConceptualisationTemplate } from "@/lib/content/templates";
import {
  autosaveDraftAction,
  submitConceptualisationAction,
  type ActionState,
} from "@/lib/practice/actions";

type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 1200;

function SaveIndicator({ status, savedAt }: { status: SaveStatus; savedAt: string | null }) {
  const label: Record<SaveStatus, string> = {
    idle: savedAt ? `Saved ${timeAgo(savedAt)}` : "Not saved yet",
    unsaved: "Unsaved changes",
    saving: "Saving…",
    saved: savedAt ? `Saved ${timeAgo(savedAt)}` : "Saved",
    error: "Couldn't save — your text is still here",
  };

  return (
    <span
      role="status"
      aria-live="polite"
      className={
        status === "error" ? "text-[13px] text-danger" : "text-[13px] text-ink-subtle"
      }
    >
      {label[status]}
    </span>
  );
}

function timeAgo(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Screen 8 — the conceptualisation.
 *
 * Autosaves as you type so closing the tab never loses work, and states the
 * save position plainly rather than leaving it ambiguous. Submitting promotes
 * the draft to a numbered version; earlier versions are never overwritten.
 */
export function ConceptualisationForm({
  exerciseId,
  template,
  initialDraft,
  initialSavedAt,
  isRevision,
  currentVersionNumber,
}: {
  exerciseId: string;
  template: ConceptualisationTemplate;
  initialDraft: Record<string, string>;
  initialSavedAt: string | null;
  isRevision: boolean;
  currentVersionNumber: number | null;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    submitConceptualisationAction,
    {},
  );

  const valuesRef = useRef<Record<string, string>>({ ...initialDraft });
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<string | null>(initialSavedAt);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    setStatus("saving");
    try {
      const result = await autosaveDraftAction(exerciseId, { ...valuesRef.current });
      setSavedAt(result.savedAt);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [exerciseId]);

  const scheduleSave = useCallback(() => {
    setStatus("unsaved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), AUTOSAVE_DELAY_MS);
  }, [save]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const main = template.sections.filter((section) => !section.optionalDepth);
  const optional = template.sections.filter((section) => section.optionalDepth);

  function renderField(section: (typeof template.sections)[number]) {
    return (
      <Field
        key={section.id}
        htmlFor={section.id}
        label={
          <span>
            {section.title}
            {section.required ? null : (
              <span className="ml-1.5 font-normal text-ink-subtle">optional</span>
            )}
          </span>
        }
        hint={section.description}
      >
        <Textarea
          id={section.id}
          name={section.id}
          rows={4}
          defaultValue={initialDraft[section.id] ?? ""}
          placeholder={section.guidance}
          onChange={(event) => {
            valuesRef.current[section.id] = event.target.value;
            scheduleSave();
          }}
          onBlur={() => {
            if (timer.current) clearTimeout(timer.current);
            if (status === "unsaved") void save();
          }}
        />
      </Field>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="exerciseId" value={exerciseId} />

      <Panel>
        <PanelHeader
          title={`${template.name} conceptualisation`}
          description={template.scopeNote}
          action={<SaveIndicator status={status} savedAt={savedAt} />}
        />
        <PanelBody className="space-y-5">{main.map(renderField)}</PanelBody>
      </Panel>

      {optional.length ? (
        <Panel>
          <PanelHeader
            title="Optional depth"
            description="Only worth completing if you have time."
          />
          <PanelBody className="space-y-5">{optional.map(renderField)}</PanelBody>
        </Panel>
      ) : null}

      {isRevision ? (
        <Panel>
          <PanelHeader
            title="What are you changing?"
            description={`Saving creates version ${(currentVersionNumber ?? 1) + 1}. Version ${currentVersionNumber ?? 1} is kept.`}
          />
          <PanelBody>
            <Field label="Reason for the change" htmlFor="changeReason" hint="Optional.">
              <Textarea
                id="changeReason"
                name="changeReason"
                rows={2}
                placeholder="What prompted the revision?"
              />
            </Field>
          </PanelBody>
        </Panel>
      ) : null}

      <FormError>{state.error}</FormError>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Submitting…">
          {isRevision ? "Save revision and return to the questions" : "Submit conceptualisation"}
        </SubmitButton>
        <SaveIndicator status={status} savedAt={savedAt} />
      </div>

      {!isRevision ? (
        <Notice>
          <p>
            Submitting starts the critical-thinking stage. You can come back and revise at
            any point during it — each revision is kept as a new version, so you can see
            what changed.
          </p>
        </Notice>
      ) : null}
    </form>
  );
}
