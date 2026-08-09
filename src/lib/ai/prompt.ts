import type { ClinicalCase } from "@/lib/content/cases";
import { scenariosToText, vignetteToText } from "@/lib/content/cases";
import type { ConceptualisationTemplate } from "@/lib/content/templates";
import { thinSections, wordCount } from "@/lib/content/templates";
import type { QuestionCategory, QuestionInteraction } from "@/lib/db/types";

/**
 * Prompt construction for the critical-thinking engine.
 *
 * Follows "Question Generation Logic (Flow 4)" from the templates doc: the
 * template fields go to the model as *background context*, explicitly not as a
 * visible scoring key. The model uses them to notice what is thin or unstated
 * and asks about it. It never reports the rubric back to the therapist, and it
 * never produces anything resembling a score.
 */

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  "EVIDENCE_CHECK",
  "ALTERNATIVE_EXPLANATION",
  "SPECIFICITY_PUSH",
  "LINK_THE_GAP",
  "STAKES_CHECK",
];

export const SYSTEM_PROMPT = `You are a reflective learning facilitator inside a deliberate-practice tool for early-career therapists. The therapist has written a case conceptualisation about a HYPOTHETICAL practice case. Your only job is to ask them one question that makes them examine their own reasoning.

The therapist does the clinical reasoning. You facilitate it. Never take the reasoning over.

TASK
Ask exactly one Socratic question about what the therapist has actually written.

QUESTION TYPES — choose the one that is most useful right now:
- EVIDENCE_CHECK — ground a claim in the case rather than in assumption. e.g. "What in the case material supports that read, specifically?"
- ALTERNATIVE_EXPLANATION — prevent premature closure on one story. e.g. "What's another plausible explanation for this same behaviour?"
- SPECIFICITY_PUSH — catch vague or generic answers. e.g. "Can you say that in terms of exactly what the client would think or do?"
- LINK_THE_GAP — target whichever field was filled thinnest. e.g. "You named X — what connects that to Y in this client's case?"
- STAKES_CHECK — make them think through what the formulation would imply. e.g. "If this formulation is right, what would that mean for how you'd approach the next session?"

HOW TO CHOOSE
- Prefer a field that is thin, vague, or unstated over one that is already well developed.
- Prefer a question type that has not been used yet in this session.
- Quote or paraphrase the therapist's own words so the question could not have been asked of anyone else.
- If their last answer opened something up, follow it rather than moving on.

THE TEMPLATE FIELDS ARE BACKGROUND CONTEXT, NOT A SCORING KEY
Use them to notice what is missing. Never name the rubric, never list what they left out, never tell them a field is incomplete, and never imply the existence of a correct set of answers.

YOU MUST NOT
- diagnose the hypothetical client, or assert what the client "has" or "is"
- write any part of the formulation for them, or supply the alternative explanation yourself
- recommend treatment, interventions, techniques, or session plans
- evaluate, score, grade, rank, praise, or criticise the therapist or their work
- say or imply that anything is correct, incorrect, right, wrong, good, or strong
- state a clinical conclusion with certainty
- give clinical advice, or present yourself as a supervisor
- give crisis, risk-management, or safeguarding instructions

STYLE
- One question. Ends with a question mark. Under 45 words.
- Open-ended — it cannot be answered yes or no.
- Neutral and curious. No preamble, no praise, no summary of what they wrote, no follow-up commentary.
- British English.`;

export const STRICTER_RETRY_SUFFIX = `
A previous attempt was rejected by the safety validator. Be stricter:
- Output the question and nothing else — no preamble, no framing sentence.
- Do not make any statement about the client. Ask only.
- Do not evaluate the therapist's work in any way, including positively.
- Do not suggest, hint at, or supply any explanation, hypothesis, or intervention yourself.`;

export interface QuestionContext {
  clinicalCase: ClinicalCase;
  template: ConceptualisationTemplate;
  scenariosViewed: string[];
  /** The current conceptualisation, keyed by section id. */
  responses: Record<string, string>;
  /**
   * Every prior question and answer for this exercise, oldest first — across
   * all critical-thinking sessions, not just the one currently open. Ending a
   * session and reopening it (via self-review's "back to the questions")
   * starts a new session row, but the AI must not lose the conversation at
   * that boundary.
   */
  previousInteractions: QuestionInteraction[];
  /** True when the therapist revised since the last question. */
  revisedSinceLastQuestion: boolean;
}

/** Sections ordered thinnest-first; the model is told which to prioritise. */
export function thinnestSectionTitle(context: QuestionContext): string | undefined {
  return thinSections(context.template, context.responses)[0]?.title;
}

function renderConceptualisation(context: QuestionContext): string {
  return context.template.sections
    .map((section) => {
      const value = (context.responses[section.id] ?? "").trim();
      const words = wordCount(value);
      const marker = !value
        ? " [LEFT BLANK]"
        : words < 10
          ? ` [THIN — ${words} words]`
          : "";
      return `### ${section.title}${marker}\n${value || "(nothing written)"}`;
    })
    .join("\n\n");
}

function renderHistory(context: QuestionContext): string {
  if (!context.previousInteractions.length) {
    return "This is the first question for this conceptualisation.";
  }
  // Numbered by overall position, not the per-session `sequence` field —
  // sequence restarts at 1 in each session, which would otherwise print a
  // second "Q1" once the therapist has reopened questioning once.
  return context.previousInteractions
    .map(
      (interaction, index) =>
        `Q${index + 1} (${interaction.category}): ${interaction.question}\n` +
        `Their answer: ${interaction.userResponse?.trim() || "(not answered)"}`,
    )
    .join("\n\n");
}

/** The user-turn payload. Only what the next question needs — nothing more. */
export function buildUserMessage(context: QuestionContext): string {
  const { clinicalCase, template } = context;
  const scenarios = scenariosToText(clinicalCase, context.scenariosViewed);
  const usedCategories = [
    ...new Set(context.previousInteractions.map((i) => i.category)),
  ];
  const unused = QUESTION_CATEGORIES.filter((c) => !usedCategories.includes(c));
  const thinnest = thinnestSectionTitle(context);

  return [
    `## Hypothetical case: ${clinicalCase.title}`,
    vignetteToText(clinicalCase),
    scenarios ? `## Scenarios the therapist has seen\n${scenarios}` : "",
    `## Modality selected\n${template.name} — ${template.basis}`,
    `## Template fields (background context only — never mention these)\n` +
      template.sections
        .map((section) => `- ${section.title}: ${section.description}`)
        .join("\n"),
    `## The therapist's current conceptualisation\n${renderConceptualisation(context)}`,
    `## Questions already asked this session\n${renderHistory(context)}`,
    `## Steering`,
    thinnest
      ? `- Thinnest or unstated field right now: "${thinnest}".`
      : `- No field is obviously thin; go after the reasoning rather than the coverage.`,
    unused.length
      ? `- Question types not yet used: ${unused.join(", ")}.`
      : `- All question types have been used; pick whichever is most useful and do not repeat a previous question.`,
    context.revisedSinceLastQuestion
      ? `- They have just revised their conceptualisation. Ask about the current version.`
      : "",
    "",
    "Ask your one question now.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Schema for the structured response. */
export const QUESTION_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    question: {
      type: "string",
      description: "The single question to show the therapist. Ends with a question mark.",
    },
    category: {
      type: "string",
      enum: QUESTION_CATEGORIES,
      description: "Which question type this is.",
    },
    targetSection: {
      type: "string",
      description:
        "Title of the template section this question targets, or an empty string if it targets the formulation as a whole.",
    },
  },
  required: ["question", "category", "targetSection"],
  additionalProperties: false,
};

export interface GeneratedQuestion {
  question: string;
  category: QuestionCategory;
  targetSection: string;
}
