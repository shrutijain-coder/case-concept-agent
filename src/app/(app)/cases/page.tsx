import { redirect } from "next/navigation";

/**
 * The case library was merged into the dashboard. This redirect keeps old
 * links and bookmarks working, forwarding any search/filter params along.
 */
export default async function CaseLibraryRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  const queryString = query.toString();
  redirect(queryString ? `/dashboard?${queryString}` : "/dashboard");
}
