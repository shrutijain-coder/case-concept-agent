import type { QuestionCategory } from "@/lib/db/types";

/**
 * The vetted fallback library.
 *
 * Used when the model is unavailable, when generation fails, or when a
 * generated question fails the safety validator twice. Every question here is
 * fixed text — nothing is generated at runtime — so the exercise degrades to
 * a slightly less tailored version of itself rather than breaking.
 *
 * `{field}` is substituted with the title of the thinnest template section.
 */

interface FallbackQuestion {
  category: QuestionCategory;
  text: string;
  /** True when the text contains a {field} slot. */
  needsField?: boolean;
}

const LIBRARY: FallbackQuestion[] = [
  // Evidence check — ground the claim in the case, not assumption.
  {
    category: "EVIDENCE_CHECK",
    text: "What in the case material supports that read, specifically?",
  },
  {
    category: "EVIDENCE_CHECK",
    text: "Which part of your conceptualisation rests most heavily on inference rather than something the client actually said or did?",
  },
  {
    category: "EVIDENCE_CHECK",
    text: "If a colleague asked you to point at the evidence for this, which lines from the case would you point to?",
  },

  // Alternative explanation — prevent premature closure.
  {
    category: "ALTERNATIVE_EXPLANATION",
    text: "What's another plausible explanation for this same behaviour?",
  },
  {
    category: "ALTERNATIVE_EXPLANATION",
    text: "If your current account turned out to be wrong, what would the second-best explanation be?",
  },
  {
    category: "ALTERNATIVE_EXPLANATION",
    text: "What would you need to see in this case to move away from the explanation you've written?",
  },

  // Specificity push — catch vague or generic answers.
  {
    category: "SPECIFICITY_PUSH",
    text: "Can you say that in terms of exactly what this client would think or do?",
  },
  {
    category: "SPECIFICITY_PUSH",
    text: "Could that sentence apply to almost any client? If so, what makes it about this one?",
  },
  {
    category: "SPECIFICITY_PUSH",
    text: "What would this look like in a specific moment from the case, rather than in general?",
  },

  // Link-the-gap — target the thinnest field.
  {
    category: "LINK_THE_GAP",
    text: "You've said less about {field} than the rest. What connects it to the rest of your formulation?",
    needsField: true,
  },
  {
    category: "LINK_THE_GAP",
    text: "How does {field} follow from what you wrote elsewhere in this conceptualisation?",
    needsField: true,
  },
  {
    category: "LINK_THE_GAP",
    text: "Which two parts of your conceptualisation are you least confident actually connect to each other?",
  },

  // Stakes check — what the formulation would imply.
  {
    category: "STAKES_CHECK",
    text: "If this formulation is right, what would that mean for how you'd approach the next session?",
  },
  {
    category: "STAKES_CHECK",
    text: "What would you be getting wrong about this client if you acted on this formulation and it turned out to be off?",
  },
  {
    category: "STAKES_CHECK",
    text: "Which part of this formulation would matter most to get right, and why that part?",
  },
];

export interface FallbackResult {
  question: string;
  category: QuestionCategory;
  /** The field title substituted into the question, when it named one. */
  targetSection: string | null;
}

/**
 * Picks a fallback question, preferring a category the session has not used.
 *
 * The doc's heuristic — "target the link-the-gap question at whichever field
 * is shortest/vaguest" — is applied when a thin field is known and LINK_THE_GAP
 * has not been used yet.
 */
export function pickFallback(options: {
  usedCategories: QuestionCategory[];
  usedQuestions: string[];
  thinnestFieldTitle?: string;
}): FallbackResult {
  const { usedCategories, usedQuestions, thinnestFieldTitle } = options;
  const usedCategorySet = new Set(usedCategories);
  const usedQuestionSet = new Set(usedQuestions.map((q) => q.trim().toLowerCase()));

  const render = (entry: FallbackQuestion): string =>
    entry.needsField
      ? entry.text.replace("{field}", (thinnestFieldTitle ?? "that section").toLowerCase())
      : entry.text;

  const usable = LIBRARY.filter(
    (entry) =>
      (!entry.needsField || Boolean(thinnestFieldTitle)) &&
      !usedQuestionSet.has(render(entry).trim().toLowerCase()),
  );

  const pool = usable.length ? usable : LIBRARY;

  // Prefer the thin-field question first time round, then any unused category.
  const preferred =
    (thinnestFieldTitle && !usedCategorySet.has("LINK_THE_GAP")
      ? pool.find((entry) => entry.category === "LINK_THE_GAP" && entry.needsField)
      : undefined) ??
    pool.find((entry) => !usedCategorySet.has(entry.category)) ??
    pool[0];

  return {
    question: render(preferred),
    category: preferred.category,
    targetSection: preferred.needsField ? (thinnestFieldTitle ?? null) : null,
  };
}

/** Shown when the model was unavailable, so the swap is never silent. */
export const AI_UNAVAILABLE_NOTICE =
  "We couldn't generate a tailored question just now, so here's one from the prompt library. Your work is saved and the exercise continues as normal.";
