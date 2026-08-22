/**
 * Dashboard page route.
 * Auth-protected route displaying user's links, QR codes, and analytics.
 * Surface Mode: Operate
 * Used by: TanStack Router for route "/dashboard"
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your links and view performance.</p>
    </div>
  );
}
