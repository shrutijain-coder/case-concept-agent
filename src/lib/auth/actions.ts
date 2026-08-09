"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";

import { track } from "@/lib/analytics";
import { getRepository } from "@/lib/db";

import { getCurrentUser, endSession, hashPassword, startSession, verifyPassword } from "./session";

export interface FormState {
  error?: string;
  notice?: string;
}

const emailField = z.string().trim().toLowerCase().email("Enter a valid email address.");
const passwordField = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(200, "That password is too long.");

const signupSchema = z.object({
  email: emailField,
  password: passwordField,
  displayName: z.string().trim().min(2, "Enter a display name.").max(80),
  professionalRole: z.string().trim().max(120).optional().or(z.literal("")),
  experienceLevel: z.string().trim().max(120).optional().or(z.literal("")),
});

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

export async function signUpAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    professionalRole: formData.get("professionalRole"),
    experienceLevel: formData.get("experienceLevel"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const repo = getRepository();
  if (await repo.findUserByEmail(parsed.data.email)) {
    return { error: "An account already exists for that email address." };
  }

  const user = await repo.createUser({
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password),
    displayName: parsed.data.displayName,
    professionalRole: parsed.data.professionalRole || null,
    experienceLevel: parsed.data.experienceLevel || null,
  });

  await track("account_created", user.id);
  await startSession(user.id);
  redirect("/safety-notice");
}

export async function logInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = z
    .object({ email: emailField, password: z.string().min(1, "Enter your password.") })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const record = await getRepository().findUserByEmail(parsed.data.email);
  // Same message either way — don't confirm which addresses have accounts.
  const invalid = { error: "Email or password is incorrect." };
  if (!record) return invalid;
  if (!(await verifyPassword(parsed.data.password, record.passwordHash))) return invalid;

  await startSession(record.id);
  redirect(record.safetyAckAt ? "/dashboard" : "/safety-notice");
}

export async function logOutAction(): Promise<void> {
  await endSession();
  redirect("/login");
}

export async function acknowledgeSafetyAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await getRepository().acknowledgeSafetyNotice(user.id);
  redirect("/dashboard");
}

// --- password reset ---------------------------------------------------------

const RESET_TTL_MINUTES = 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Issues a reset token.
 *
 * Email delivery is not wired up in this build. In local (sqlite) development
 * the link is returned so the flow is testable end to end; in any other
 * configuration the token is written to the server log only, and the user is
 * told to check their email — which is where a real mail transport would send
 * it. Swap this for Supabase Auth's own reset flow when moving to Supabase.
 */
export async function requestPasswordResetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = emailField.safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address." };

  const generic: FormState = {
    notice: "If an account exists for that address, a reset link is on its way.",
  };

  const repo = getRepository();
  const user = await repo.findUserByEmail(parsed.data);
  if (!user) return generic;

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60_000).toISOString();
  await repo.createPasswordResetToken(user.id, hashToken(token), expiresAt);

  const link = `/reset-password?token=${token}`;
  console.info(`[auth] password reset link for ${user.email}: ${link}`);

  const isLocalDev =
    (process.env.DATA_BACKEND || "sqlite") === "sqlite" &&
    process.env.NODE_ENV !== "production";

  return isLocalDev
    ? {
        notice: `Email delivery isn't configured in this build. Development reset link (valid ${RESET_TTL_MINUTES} minutes): ${link}`,
      }
    : generic;
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = z
    .object({ token: z.string().min(1), password: passwordField })
    .safeParse({ token: formData.get("token"), password: formData.get("password") });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const repo = getRepository();
  const userId = await repo.consumePasswordResetToken(hashToken(parsed.data.token));
  if (!userId) {
    return { error: "That reset link has expired or already been used. Request a new one." };
  }

  await repo.updateUserPassword(userId, await hashPassword(parsed.data.password));
  await startSession(userId);
  redirect("/dashboard");
}
