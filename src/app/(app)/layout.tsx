import Link from "next/link";
import type { ReactNode } from "react";
import { NotebookPen } from "lucide-react";

import { NavLinks } from "@/components/nav-links";
import { SubmitButton } from "@/components/submit-button";
import { logOutAction } from "@/lib/auth/actions";
import { requireAcknowledgedUser } from "@/lib/auth/guard";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireAcknowledgedUser();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-line bg-surface md:sticky md:top-0 md:h-dvh md:w-60 md:border-r md:border-b-0">
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <Link
            href="/dashboard"
            className="group mb-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-sunken"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white shadow-xs">
              <NotebookPen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-base font-bold tracking-tight text-ink group-hover:text-brand transition-colors">
                Caseform
              </span>
              <span className="block text-[10px] font-semibold tracking-wider uppercase text-ink-subtle">
                Practice Platform
              </span>
            </div>
          </Link>

          <NavLinks />

          <div className="mt-auto hidden border-t border-line pt-3 md:block">
            <p className="truncate px-2.5 text-[13px] text-ink">{user.displayName}</p>
            <p className="truncate px-2.5 text-[12px] text-ink-subtle">{user.email}</p>
            <form action={logOutAction} className="mt-2 px-1">
              <SubmitButton variant="ghost" size="sm" pendingLabel="Logging out…">
                Log out
              </SubmitButton>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
