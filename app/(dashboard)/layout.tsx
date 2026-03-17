import { createServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";

const isSupabaseConfigured =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").startsWith("https://") &&
  !(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let orgName = "Demo Org";
  let email = "demo@example.com";

  if (isSupabaseConfigured) {
    const { redirect } = await import("next/navigation");
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    orgName =
      (user.user_metadata["orgName"] as string | undefined) ?? "My Organisation";
    email = user.email ?? "";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav userEmail={email} orgName={orgName} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
