import type { ModalityId } from "@/lib/db/types";

/**
 * Conceptualisation templates.
 *
 * Source: docs/"conceptualisation and question templates.docx".
 *   - CBT  — Beck's cognitive model (core belief → intermediate beliefs →
 *            situation → automatic thought → reaction), plus the Persons &
 *            Tompkins formulation elements (origins, mechanism, precipitant).
 *   - DBT  — Linehan's biosocial theory and target hierarchy.
 *
 * Templates are data, not components. Adding a modality means adding an entry
 * here; no screen, action, or query changes.
 */

export interface TemplateSection {
  id: string;
  title: string;
  /** What belongs in the field. Shown under the label. */
  description: string;
  /** The helper prompt from the source doc. Shown as the field placeholder. */
  guidance: string;
  fieldType: "long_text" | "short_text";
  required: boolean;
  order: number;
  /** Rendered under an "Optional depth" divider rather than in the main flow. */
  optionalDepth?: boolean;
}

export interface ConceptualisationTemplate {
  templateId: string;
  modalityId: ModalityId;
  version: number;
  name: string;
  /** One line on the theoretical basis. Shown on the modality-selection screen. */
  basis: string;
  /** Guidance the doc gives about which fields can be dropped under time pressure. */
  scopeNote: string;
  sections: TemplateSection[];
}

const CBT: ConceptualisationTemplate = {
  templateId: "cbt-v1",
  modalityId: "cbt",
  version: 1,
  name: "CBT",
  basis:
    "Beck's cognitive model, with formulation elements from Persons & Tompkins.",
  scopeNote:
    "The Beck chain — core belief, intermediate beliefs, situation, automatic thought, reaction — is load-bearing. Origins and maintaining mechanism are the fields to drop if you are short on time.",
  sections: [
    {
      id: "presenting_problem",
      title: "Presenting problem",
      description: "The issue as you would state it clinically.",
      guidance:
        "What's the client struggling with, in one or two sentences?",
      fieldType: "long_text",
      required: true,
      order: 1,
    },
    {
      id: "origins",
      title: "Origins",
      description:
        "Where this pattern likely developed — historical and developmental.",
      guidance:
        "What in the client's history might explain why this belief took hold?",
      fieldType: "long_text",
      required: false,
      order: 2,
    },
    {
      id: "core_belief",
      title: "Core belief",
      description: "The deep, global belief about self, others, or the world.",
      guidance:
        "What's the client's core belief about themselves, others, or the world?",
      fieldType: "long_text",
      required: true,
      order: 3,
    },
    {
      id: "intermediate_beliefs",
      title: "Intermediate beliefs",
      description:
        "The rules, attitudes, or assumptions that follow from the core belief.",
      guidance:
        "What 'rule' or assumption does the client live by that follows from that core belief? (e.g., 'If I'm not perfect, I'll be rejected.')",
      fieldType: "long_text",
      required: true,
      order: 4,
    },
    {
      id: "situation",
      title: "Situation / precipitant",
      description: "The specific triggering event from the case.",
      guidance:
        "Pick one concrete moment from the case that activates this pattern.",
      fieldType: "long_text",
      required: true,
      order: 5,
    },
    {
      id: "automatic_thought",
      title: "Automatic thought",
      description: "The in-the-moment thought triggered by the situation.",
      guidance: "What's likely going through their mind right then?",
      fieldType: "long_text",
      required: true,
      order: 6,
    },
    {
      id: "reaction",
      title: "Reaction",
      description:
        "Emotional, behavioural, and physiological response, taken together.",
      guidance: "What do they feel, do, and physically notice, in that moment?",
      fieldType: "long_text",
      required: true,
      order: 7,
    },
    {
      id: "maintaining_mechanism",
      title: "Maintaining mechanism",
      description:
        "How the reaction loops back and reinforces the core belief or pattern.",
      guidance:
        "How does this reaction end up confirming or strengthening the original belief, keeping the cycle going?",
      fieldType: "long_text",
      required: false,
      order: 8,
    },
  ],
};

const DBT: ConceptualisationTemplate = {
  templateId: "dbt-v1",
  modalityId: "dbt",
  version: 1,
  name: "DBT",
  basis: "Linehan's biosocial theory and target hierarchy.",
  scopeNote:
    "The eight core fields are the working set. Treatment stage is optional depth — complete it only if you have time.",
  sections: [
    {
      id: "target_behavior",
      title: "Target behaviour",
      description: "The behaviour you are formulating, in observable terms.",
      guidance:
        "What exactly does the client do — described so someone could see it happening?",
      fieldType: "long_text",
      required: true,
      order: 1,
    },
    {
      id: "biological_vulnerability",
      title: "Biological / temperamental vulnerability",
      description: "Baseline emotional reactivity, separate from any one event.",
      guidance:
        "What suggests a baseline sensitivity to emotional reactivity, independent of any one event?",
      fieldType: "long_text",
      required: true,
      order: 2,
    },
    {
      id: "invalidating_environment",
      title: "Invalidating environment (historical)",
      description: "The environmental half of the biosocial model.",
      guidance:
        "What in the client's history suggests their emotional responses were routinely dismissed or punished?",
      fieldType: "long_text",
      required: true,
      order: 3,
    },
    {
      id: "prompting_event",
      title: "Prompting event",
      description: "The specific trigger for this instance of the behaviour.",
      guidance: "What was the specific thing that set this off?",
      fieldType: "long_text",
      required: true,
      order: 4,
    },
    {
      id: "chain_of_links",
      title: "Chain of links",
      description: "The sequence between prompting event and behaviour.",
      guidance:
        "Walk through the sequence — thoughts, feelings, sensations, urges — leading to the behaviour.",
      fieldType: "long_text",
      required: true,
      order: 5,
    },
    {
      id: "consequences",
      title: "Consequences",
      description: "Short-term reinforcement and longer-term cost.",
      guidance:
        "What did the behaviour get them immediately? What did it cost them after?",
      fieldType: "long_text",
      required: true,
      order: 6,
    },
    {
      id: "target_hierarchy",
      title: "Target hierarchy placement",
      description: "Where this behaviour sits in DBT's priority order.",
      guidance:
        "Life-threatening, therapy-interfering, quality-of-life-interfering, or a skills deficit?",
      fieldType: "long_text",
      required: true,
      order: 7,
    },
    {
      id: "skills_vs_motivation",
      title: "Skills deficit vs. motivation",
      description:
        "Whether the difficulty is capability or something blocking use of the capability.",
      guidance:
        "If they had the skill to do something different, would they have used it?",
      fieldType: "long_text",
      required: true,
      order: 8,
    },
    {
      id: "treatment_stage",
      title: "Treatment stage",
      description: "Optional depth. Complete only if you have time.",
      guidance:
        "Given the severity and frequency of this behaviour, does this look like Stage 1 (safety and stabilisation) or later-stage work?",
      fieldType: "long_text",
      required: false,
      order: 9,
      optionalDepth: true,
    },
  ],
};

export const TEMPLATES: Record<ModalityId, ConceptualisationTemplate> = {
  cbt: CBT,
  dbt: DBT,
};

export const MODALITIES: ModalityId[] = ["cbt", "dbt"];

export function getTemplate(modalityId: ModalityId): ConceptualisationTemplate {
  const template = TEMPLATES[modalityId];
  if (!template) throw new Error(`Unknown modality: ${modalityId}`);
  return template;
}

export function isModalityId(value: unknown): value is ModalityId {
  return value === "cbt" || value === "dbt";
}

/** Required sections that are still empty. Drives the submit gate. */
export function missingRequiredSections(
  template: ConceptualisationTemplate,
  responses: Record<string, string>,
): TemplateSection[] {
  return template.sections.filter(
    (section) => section.required && !(responses[section.id] ?? "").trim(),
  );
}

/**
 * Thin-field heuristic from the source doc: "target the link-the-gap question
 * at whichever field is shortest/vaguest (e.g. under ~10 words or missing)."
 * Used both to steer the model and to pick a fallback question offline.
 */
export const THIN_FIELD_WORD_THRESHOLD = 10;

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function thinSections(
  template: ConceptualisationTemplate,
  responses: Record<string, string>,
): TemplateSection[] {
  return template.sections
    .filter((section) => !section.optionalDepth)
    .map((section) => ({
      section,
      words: wordCount(responses[section.id] ?? ""),
    }))
    .filter(({ words }) => words < THIN_FIELD_WORD_THRESHOLD)
    .sort((a, b) => a.words - b.words)
    .map(({ section }) => section);
}
