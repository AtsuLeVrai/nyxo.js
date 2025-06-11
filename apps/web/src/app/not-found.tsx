import { redirect } from "next/navigation";

/**
 * Custom 404 Not Found page component.
 *
 * Automatically redirects users to the homepage when they access a non-existent route.
 * This provides a seamless user experience by preventing broken page states.
 */
export default function NotFound(): never {
  return redirect("/");
}
