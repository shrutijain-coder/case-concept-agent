import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";

import { track } from "@/lib/analytics";
import type { QuestionCategory } from "@/lib/db/types";

import { AI_UNAVAILABLE_NOTICE, pickFallback } from "./fallback";
import {
  buildUserMessage,
  QUESTION_CATEGORIES,
  QUESTION_SCHEMA,
  STRICTER_RETRY_SUFFIX,
  SYSTEM_PROMPT,
  thinnestSectionTitle,
  type GeneratedQuestion,
  type QuestionContext,
} from "./prompt";
import { validateQuestion } from "./validate";

const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
/** Target from the technical PRD is <10s; leave headroom, then fall back. */
const REQUEST_TIMEOUT_MS = 18_000;

let cachedAnthropicClient: Anthropic | null = null;
let cachedGroqClient: Groq | null = null;

function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!cachedAnthropicClient) {
    cachedAnthropicClient = new Anthropic({
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: 1,
    });
  }
  return cachedAnthropicClient;
}

function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!cachedGroqClient) {
    cachedGroqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: 1,
    });
  }
  return cachedGroqClient;
}

function getActiveProvider(): "anthropic" | "groq" | null {
  const provider = process.env.AI_PROVIDER;
  if (provider === "anthropic") {
    return process.env.ANTHROPIC_API_KEY ? "anthropic" : null;
  }
  if (provider === "groq") {
    return process.env.GROQ_API_KEY ? "groq" : null;
  }
  
  // Auto-detect based on available keys if not explicitly configured
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GROQ_API_KEY) return "groq";
  return null;
}

export interface QuestionResult {
  question: string;
  category: QuestionCategory;
  source: "ai" | "fallback";
  /** The template section this question was about, if any. */
  targetSection: string | null;
  /** Set when the fallback library was used, so the UI can say so. */
  notice?: string;
}

function parseResponse(raw: string): GeneratedQuestion | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GeneratedQuestion>;
    if (typeof parsed.question !== "string" || !parsed.question.trim()) return null;
    const category = QUESTION_CATEGORIES.includes(parsed.category as QuestionCategory)
      ? (parsed.category as QuestionCategory)
      : "EVIDENCE_CHECK";
    return {
      question: parsed.question.trim(),
      category,
      targetSection: typeof parsed.targetSection === "string" ? parsed.targetSection : "",
    };
  } catch {
    return null;
  }
}

async function callModel(
  provider: "anthropic" | "groq",
  context: QuestionContext,
  stricter: boolean,
): Promise<GeneratedQuestion | null> {
  if (provider === "anthropic") {
    const client = getAnthropicClient();
    if (!client) return null;
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: stricter ? `${SYSTEM_PROMPT}\n${STRICTER_RETRY_SUFFIX}` : SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: QUESTION_SCHEMA } },
      messages: [{ role: "user", content: buildUserMessage(context) }],
    });

    if (response.stop_reason === "refusal") return null;

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock ? parseResponse(textBlock.text) : null;
  } else {
    const client = getGroqClient();
    if (!client) return null;
    const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

    const systemPrompt = (stricter ? `${SYSTEM_PROMPT}\n${STRICTER_RETRY_SUFFIX}` : SYSTEM_PROMPT) +
      `\nYou must output a JSON object that matches this JSON schema:\n${JSON.stringify(QUESTION_SCHEMA)}`;

    const response = await client.chat.completions.create({
      model: model,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserMessage(context) },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    return content ? parseResponse(content) : null;
  }
}

/**
 * Produces the next critical-thinking question.
 *
 * Generate → validate → regenerate stricter → validate → vetted fallback.
 * This function never throws: an unusable model must degrade the exercise,
 * not end it.
 */
export async function generateQuestion(
  context: QuestionContext,
  userId: string,
): Promise<QuestionResult> {
  const previousQuestions = context.previousInteractions.map((i) => i.question);
  const fallbackOptions = {
    usedCategories: context.previousInteractions.map((i) => i.category),
    usedQuestions: previousQuestions,
    thinnestFieldTitle: thinnestSectionTitle(context),
  };

  const provider = getActiveProvider();
  if (!provider) {
    // No key configured. Not an error state — the library covers it.
    const fallback = pickFallback(fallbackOptions);
    return { ...fallback, source: "fallback", notice: AI_UNAVAILABLE_NOTICE };
  }

  for (const stricter of [false, true]) {
    try {
      const generated = await callModel(provider, context, stricter);
      if (!generated) continue;

      const verdict = validateQuestion(generated.question, previousQuestions);
      if (verdict.ok) {
        return {
          question: generated.question,
          category: generated.category,
          source: "ai",
          targetSection: generated.targetSection.trim() || null,
        };
      }

      await track("ai_output_rejected", userId, {
        reasons: verdict.reasons,
        attempt: stricter ? "strict" : "first",
      });
    } catch (error) {
      await track("ai_generation_failed", userId, {
        attempt: stricter ? "strict" : "first",
        message: error instanceof Error ? error.message : String(error),
      });
      console.error("[ai] question generation failed", error);
    }
  }

  const fallback = pickFallback(fallbackOptions);
  return { ...fallback, source: "fallback", notice: AI_UNAVAILABLE_NOTICE };
}
