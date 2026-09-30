import "server-only";
import { redirect } from "next/navigation";
import { getViewer } from "./viewer";

/** For pages behind sign-in: the demo or an account that has finished onboarding. */
export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-up");
  if (!viewer.onboarded) redirect("/onboarding");
  return viewer;
}
