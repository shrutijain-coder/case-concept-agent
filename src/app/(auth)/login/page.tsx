"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Field, FormError, Input, Panel, PanelBody } from "@/components/ui";
import { logInAction, type FormState } from "@/lib/auth/actions";

export default function LoginPage() {
  const [state, formAction] = useActionState<FormState, FormData>(logInAction, {});

  return (
    <Panel>
      <PanelBody className="py-5">
        <h1 className="mb-4">Log in</h1>
        <form action={formAction} className="space-y-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>

          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>

          <FormError>{state.error}</FormError>

          <SubmitButton className="w-full" pendingLabel="Logging in…">
            Log in
          </SubmitButton>
        </form>

        <div className="mt-4 flex items-center justify-between text-[13px]">
          <Link href="/signup" className="text-brand hover:underline">
            Create an account
          </Link>
          <Link href="/forgot-password" className="text-ink-muted hover:underline">
            Forgot password?
          </Link>
        </div>
      </PanelBody>
    </Panel>
  );
}
