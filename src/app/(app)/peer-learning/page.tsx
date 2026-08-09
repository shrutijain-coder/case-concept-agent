import { ButtonLink, Panel, PanelBody, PanelHeader } from "@/components/ui";
import { requireAcknowledgedUser } from "@/lib/auth/guard";
import { getRepository } from "@/lib/db";

/**
 * Peer learning is the next milestone. The data model, permissions, and RLS
 * policies for it already exist (see src/lib/db/supabase-schema.sql); what is
 * missing is the group, submission, comment, and moderation UI.
 *
 * This page says that plainly rather than showing an empty shell that implies
 * the feature works.
 */
export default async function PeerLearningPage() {
  const user = await requireAcknowledgedUser();
  const groups = await getRepository().listGroupsForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1>Peer learning</h1>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          Share a conceptualisation with a group you choose, and read how other therapists
          approached the same case.
        </p>
      </div>

      <Panel>
        <PanelHeader title="Your groups" />
        <PanelBody className="space-y-3 text-sm">
          {groups.length ? (
            <ul className="space-y-1">
              {groups.map((group) => (
                <li key={group.id} className="text-ink">
                  {group.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted">You are not in any peer groups.</p>
          )}

          <div className="border-t border-line pt-3">
            <p className="text-ink">Not built yet.</p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Group membership, private submissions, free-form comments, reporting, and
              moderation are the next milestone. The storage model and the server-side
              permission rules are already in place, so the work here is the interface.
            </p>
            <p className="mt-2 text-[13px] text-ink-muted">
              In the meantime you can still choose &ldquo;share with peers&rdquo; at the
              self-review step. That choice is recorded against the exercise, and nothing is
              visible to anyone else until this milestone ships.
            </p>
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader title="How feedback will work" />
        <PanelBody className="space-y-2 text-[13px] text-ink-muted">
          <p>
            Feedback is a peer perspective, not supervision and not expert review. Comments
            are free-form: no ratings, no scores, no rubrics, no upvotes.
          </p>
          <p>
            Submissions are visible only to the group you pick. Nothing is ever public, and
            the rule is enforced on the server rather than in the browser.
          </p>
        </PanelBody>
      </Panel>

      <div>
        <ButtonLink href="/dashboard" variant="secondary" size="sm">
          Back to the dashboard
        </ButtonLink>
      </div>
    </div>
  );
}
