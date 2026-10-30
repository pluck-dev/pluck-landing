import { requireAdmin } from "@/lib/crm/auth";
import { AdminShell } from "./_app/shell";
import type { Seed } from "./_app/store";

/**
 * Rendered once per hard load: verifies the admin (local JWT check + is_admin()),
 * then hands off to the client shell, which fetches data straight from Supabase.
 */
export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  let fixture: Seed | null = null;
  if (admin.fixture) {
    const f = await import("@/lib/crm/fixture");
    fixture = {
      inquiries: f.fixtureInquiries,
      clients: f.fixtureClients,
      projects: f.fixtureProjects,
      tasks: f.fixtureTasks,
      payments: f.fixturePayments,
      activity: f.fixtureActivity,
    };
  }
  return (
    <AdminShell email={admin.email} fixture={fixture}>
      {children}
    </AdminShell>
  );
}
