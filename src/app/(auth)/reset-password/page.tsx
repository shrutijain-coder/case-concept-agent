"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Field, FormError, Input, Panel, PanelBody } from "@/components/ui";
import { resetPasswordAction, type FormState } from "@/lib/auth/actions";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, formAction] = useActionState<FormState, FormData>(resetPasswordAction, {});

  if (!token) {
    return (
      <PanelBody className="py-5">
        <h1 className="mb-1">Reset link missing</h1>
        <p className="text-[13px] text-ink-muted">
          This page needs a reset link.{" "}
          <Link href="/forgot-password" className="text-brand hover:underline">
            Request a new one
          </Link>
          .
        </p>
      </PanelBody>
    );
  }

  return (
    <PanelBody className="py-5">
      <h1 className="mb-4">Choose a new password</h1>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <Field label="New password" htmlFor="password" hint="At least 10 characters.">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
        </Field>

        <FormError>{state.error}</FormError>

        <SubmitButton className="w-full" pendingLabel="Saving…">
          Set new password
        </SubmitButton>
      </form>
    </PanelBody>
  );
}

export default function ResetPasswordPage() {
  return (
    <Panel>
      <Suspense
        fallback={
          <PanelBody className="py-5 text-[13px] text-ink-muted">Loading…</PanelBody>
        }
      >
        <ResetForm />
      </Suspense>
    </Panel>
  );
}
