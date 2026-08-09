"use client";

import { Button, Panel, PanelBody } from "@/components/ui";

/**
 * Error boundary. The message leads with the state of the user's work,
 * because that is the thing they actually want to know.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-5 py-12">
      <Panel>
        <PanelBody className="py-6">
          <h1 className="mb-2">Something went wrong</h1>
          <p className="text-sm text-ink-muted">
            Your latest saved work is safe. Nothing you had already submitted has been lost.
          </p>
          {error.digest ? (
            <p className="mt-2 font-mono text-[12px] text-ink-subtle">
              Reference: {error.digest}
            </p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <Button type="button" onClick={reset}>
              Try again
            </Button>
            <a
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-md border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-sunken"
            >
              Back to dashboard
            </a>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
