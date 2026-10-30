import { Suspense } from "react";
import { AdminRoutes } from "../_app/shell";

/**
 * Every /admin/* screen is this one page: the client router in _app/shell.tsx
 * reads the pathname and renders the view from cached data, and in-app links
 * use history.pushState — so switching tabs never re-renders on the server.
 */
export default function AdminPage() {
  return (
    <Suspense>
      <AdminRoutes />
    </Suspense>
  );
}
