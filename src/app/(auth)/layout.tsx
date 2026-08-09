import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-6">
        <p className="text-sm font-semibold text-ink">Case Conceptualisation Practice</p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Deliberate practice with hypothetical cases, between supervision sessions.
        </p>
      </div>
      {children}
      <p className="mt-6 text-[13px] text-ink-subtle">
        A learning tool. It does not replace supervision, formal training, or clinical
        consultation.
      </p>
    </div>
  );
}
