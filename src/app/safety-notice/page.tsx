import { redirect } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { Panel, PanelBody } from "@/components/ui";
import { acknowledgeSafetyAction } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

/** Screen 2 — first-use safety notice. Must be acknowledged before practising. */
export default async function SafetyNoticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.safetyAckAt) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-5 py-12">
      <Panel>
        <PanelBody className="py-6">
          <h1 className="mb-4">Before you start</h1>

          <div className="prose-clinical space-y-3 text-sm text-ink">
            <p>
              This platform is for practising with <strong>hypothetical cases</strong>. Please
              do not enter identifiable information about real clients — no names, no contact
              details, no clinical notes, no case histories.
            </p>
            <p>
              This tool does not replace supervision, formal training, or clinical
              consultation. It will not tell you which formulation is correct, and it will not
              score your work. Case conceptualisation is hypothesis-driven, and more than one
              formulation can be clinically defensible.
            </p>
            <p>
              The AI here only asks questions. It does not diagnose, does not recommend
              treatment, and is not a supervisor.
            </p>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <form action={acknowledgeSafetyAction}>
              <SubmitButton pendingLabel="Saving…">
                I understand — start practising
              </SubmitButton>
            </form>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
