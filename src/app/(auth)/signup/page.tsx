"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Field, FormError, Input, Panel, PanelBody, Select } from "@/components/ui";
import { signUpAction, type FormState } from "@/lib/auth/actions";

const EXPERIENCE_LEVELS = [
  "In training",
  "Newly qualified (under 1 year)",
  "1–3 years qualified",
  "3+ years qualified",
];

export default function SignupPage() {
  const [state, formAction] = useActionState<FormState, FormData>(signUpAction, {});

  return (
    <Panel>
      <PanelBody className="py-5">
        <h1 className="mb-4">Create an account</h1>
        <form action={formAction} className="space-y-4">
          <Field label="Display name" htmlFor="displayName">
            <Input id="displayName" name="displayName" autoComplete="name" required />
          </Field>

          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>

          <Field
            label="Password"
            htmlFor="password"
            hint="At least 10 characters."
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </Field>

          <Field label="Professional role" htmlFor="professionalRole" hint="Optional.">
            <Input
              id="professionalRole"
              name="professionalRole"
              placeholder="Trainee clinical psychologist"
            />
          </Field>

          <Field label="Experience" htmlFor="experienceLevel" hint="Optional.">
            <Select id="experienceLevel" name="experienceLevel" defaultValue="">
              <option value="">Prefer not to say</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </Field>

          <FormError>{state.error}</FormError>

          <SubmitButton className="w-full" pendingLabel="Creating account…">
            Create account
          </SubmitButton>
        </form>

        <p className="mt-4 text-[13px] text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Log in
          </Link>
        </p>
      </PanelBody>
    </Panel>
  );
}
