/**
 * Configurable prompt sets for the self-review and reflection stages.
 * The technical PRD asks for the number of reflection questions to be
 * configurable; they are data here for that reason.
 */

export interface WrittenPrompt {
  id: string;
  question: string;
  hint?: string;
  required: boolean;
}

/** Screen 8 — self-review, before deciding whether to share. */
export const SELF_REVIEW_PROMPTS: WrittenPrompt[] = [
  {
    id: "strongest",
    question: "Which part of your conceptualisation feels strongest?",
    hint: "And what makes it feel that way — evidence, fit, or familiarity?",
    required: true,
  },
  {
    id: "least_certain",
    question: "Which part feels least certain?",
    required: true,
  },
  {
    id: "next_information",
    question: "What would you want to find out next?",
    hint: "Assume you have one more session and can ask about anything.",
    required: true,
  },
  {
    id: "what_changed",
    question: "What changed in your thinking while you were answering the questions?",
    hint: "If nothing changed, that is a legitimate answer worth writing down.",
    required: false,
  },
];

/** Screen 12 — final reflection, after any revision. */
export const REFLECTION_PROMPTS: WrittenPrompt[] = [
  {
    id: "what_changed",
    question: "What changed in your conceptualisation?",
    required: true,
  },
  {
    id: "what_influenced",
    question: "What influenced the change?",
    hint: "A particular question, a piece of case material, or your own re-reading.",
    required: true,
  },
  {
    id: "about_reasoning",
    question: "What did you learn about your own reasoning?",
    required: true,
  },
  {
    id: "next_time",
    question: "What would you pay more attention to in your next conceptualisation?",
    required: false,
  },
];
