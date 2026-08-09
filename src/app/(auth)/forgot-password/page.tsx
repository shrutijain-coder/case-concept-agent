"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Field, FormError, Input, Notice, Panel, PanelBody } from "@/components/ui";
import { requestPasswordResetAction, type FormState } from "@/lib/auth/actions";

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState<FormState, FormData>(
    requestPasswordResetAction,
    {},
  );

  return (
    <Panel>
      <PanelBody className="py-5">
        <h1 className="mb-1">Reset your password</h1>
        <p className="mb-4 text-[13px] text-ink-muted">
          Enter the email address on your account and we&rsquo;ll send a reset link.
        </p>

        <form action={formAction} className="space-y-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>

          <FormError>{state.error}</FormError>

          <SubmitButton className="w-full" pendingLabel="Sending…">
            Send reset link
          </SubmitButton>
        </form>

        {state.notice ? (
          <Notice className="mt-4">
            <p className="break-words">{state.notice}</p>
          </Notice>
        ) : null}

        <p className="mt-4 text-[13px]">
          <Link href="/login" className="text-brand hover:underline">
            Back to log in
          </Link>
        </p>
      </PanelBody>
    </Panel>
  );
}
