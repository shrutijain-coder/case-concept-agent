import { redirect } from "next/navigation";

/**
 * The case library was merged into the dashboard. This redirect keeps old
 * links and bookmarks working.
 */
export default async function CaseLibraryRedirect() {
  redirect("/dashboard");
}
