/**
 * AI output validation (technical PRD §31).
 *
 * Every generated question passes through here before it can reach a screen.
 * A failure means: do not display, regenerate under a stricter prompt, and if
 * that also fails, serve a vetted fallback.
 *
 * The discriminator throughout is asking versus asserting. "If this
 * formulation is right, what would that mean for how you'd approach the next
 * session?" is a legitimate stakes-check question; "You should approach the
 * next session by..." is treatment advice. The rules below are written to
 * separate those two rather than to ban vocabulary.
 */

export type RejectionReason =
  | "not_a_question"
  | "too_long"
  | "too_short"
  | "multiple_questions"
  | "diagnostic_assertion"
  | "treatment_directive"
  | "certainty_claim"
  | "evaluates_therapist"
  | "supplies_formulation"
  | "safety_directive"
  | "mentions_rubric"
  | "duplicate";

export interface ValidationResult {
  ok: boolean;
  reasons: RejectionReason[];
}

const MIN_WORDS = 6;
const MAX_WORDS = 60;

interface Rule {
  reason: RejectionReason;
  pattern: RegExp;
}

const RULES: Rule[] = [
  // Asserting something about the hypothetical client.
  {
    reason: "diagnostic_assertion",
    pattern:
      /\bthe client (has|is likely|clearly|evidently|meets|presents with|suffers from|is experiencing)\b/i,
  },
  {
    reason: "diagnostic_assertion",
    pattern: /\b(this is|this looks like|that is) (a |an )?(classic |textbook |clear )?(case of|presentation of)\b/i,
  },
  { reason: "diagnostic_assertion", pattern: /\b(the )?diagnosis (is|would be|should be)\b/i },

  // Telling the therapist what to do clinically.
  { reason: "treatment_directive", pattern: /\byou should\b/i },
  { reason: "treatment_directive", pattern: /\byou (need|ought) to\b/i },
  { reason: "treatment_directive", pattern: /\bi (would )?(recommend|suggest|advise)\b/i },
  { reason: "treatment_directive", pattern: /\b(try|consider) (using|applying|introducing) (a|an|the)\b/i },
  { reason: "treatment_directive", pattern: /\bthe (best|right|appropriate) (intervention|approach|technique|treatment)\b/i },

  // Claiming certainty.
  { reason: "certainty_claim", pattern: /\b(obviously|undoubtedly|without doubt|certainly the)\b/i },
  { reason: "certainty_claim", pattern: /\bthe (correct|right|proper) (formulation|answer|conceptualisation|conceptualization)\b/i },
  { reason: "certainty_claim", pattern: /\bthe answer is\b/i },

  // Evaluating the therapist — including praise, which is still a grade.
  {
    reason: "evaluates_therapist",
    pattern:
      /\b(excellent|great job|well done|good work|nicely done|strong (work|formulation|conceptualisation)|weak (formulation|conceptualisation)|poor (work|formulation))\b/i,
  },
  { reason: "evaluates_therapist", pattern: /\byou (have )?(missed|failed to|got .* wrong|overlooked)\b/i },
  { reason: "evaluates_therapist", pattern: /\byour (formulation|conceptualisation|answer) is (correct|incorrect|right|wrong|good|poor|incomplete)\b/i },
  { reason: "evaluates_therapist", pattern: /\b\d{1,3}\s?%|\b(score|grade|rating|out of (five|ten|10|5))\b/i },

  // Handing the therapist a hypothesis instead of asking for one.
  { reason: "supplies_formulation", pattern: /\b(which suggests|this indicates|this means) (that )?the client\b/i },
  { reason: "supplies_formulation", pattern: /\bbecause the client (is|has|was|feels|believes)\b/i },
  { reason: "supplies_formulation", pattern: /\bthe (real|underlying|actual) (issue|problem|mechanism|driver) (is|here is)\b/i },

  // Crisis / safeguarding instructions. Directives only — asking the
  // therapist what they would want to know about risk is legitimate.
  { reason: "safety_directive", pattern: /\b(call|contact|phone) (999|911|the emergency|emergency services|the crisis team)\b/i },
  { reason: "safety_directive", pattern: /\b(you must|make sure to|be sure to) (refer|escalate|contact|report)\b/i },
  { reason: "safety_directive", pattern: /\b(complete|carry out|conduct) a (risk assessment|safety plan)\b/i },

  // Leaking the invisible rubric.
  { reason: "mentions_rubric", pattern: /\b(rubric|scoring key|checklist|marking|assessment criteria)\b/i },
  { reason: "mentions_rubric", pattern: /\byou (left|have left) .* (blank|empty|incomplete)\b/i },
  { reason: "mentions_rubric", pattern: /\b(required|mandatory) fields?\b/i },
];

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Rough token-set overlap. Catches "same question, reworded". */
function similarity(a: string, b: string): number {
  const tokenise = (text: string) =>
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3),
    );
  const left = tokenise(a);
  const right = tokenise(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / new Set([...left, ...right]).size;
}

const DUPLICATE_THRESHOLD = 0.6;

export function validateQuestion(
  question: string,
  previousQuestions: string[] = [],
): ValidationResult {
  const reasons: RejectionReason[] = [];
  const text = question.trim();

  if (!text.endsWith("?")) reasons.push("not_a_question");

  const words = countWords(text);
  if (words < MIN_WORDS) reasons.push("too_short");
  if (words > MAX_WORDS) reasons.push("too_long");

  // One question mark only — a list of questions is not the interaction model.
  if ((text.match(/\?/g) ?? []).length > 1) reasons.push("multiple_questions");

  for (const rule of RULES) {
    if (rule.pattern.test(text) && !reasons.includes(rule.reason)) {
      reasons.push(rule.reason);
    }
  }

  if (previousQuestions.some((prev) => similarity(prev, text) >= DUPLICATE_THRESHOLD)) {
    reasons.push("duplicate");
  }

  return { ok: reasons.length === 0, reasons };
}
