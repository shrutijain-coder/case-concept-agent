import type { ReactNode } from "react";
import { NotebookPen } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shadow-xs">
            <NotebookPen className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-ink">Caseform</span>
        </div>
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
