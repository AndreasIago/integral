import { Suspense } from "react";
import { FilterBar } from "@/components/integrations/filter-bar";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { MOCK_INTEGRATIONS } from "@/lib/seed/mock-integrations";
import type { IntegrationStatus, IntegrationCategory } from "@/app/generated/prisma/enums";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}

function IntegrationGrid({
  q,
  status,
  category,
}: {
  q: string;
  status: string;
  category: string;
}) {
  let integrations = MOCK_INTEGRATIONS;

  if (q) {
    const query = q.toLowerCase();
    integrations = integrations.filter((i) =>
      i.name.toLowerCase().includes(query)
    );
  }

  if (status) {
    integrations = integrations.filter(
      (i) => i.status === (status as IntegrationStatus)
    );
  }

  if (category) {
    integrations = integrations.filter(
      (i) => i.category === (category as IntegrationCategory)
    );
  }

  const counts = {
    total: MOCK_INTEGRATIONS.length,
    active: MOCK_INTEGRATIONS.filter((i) => i.status === "ACTIVE").length,
    expiring: MOCK_INTEGRATIONS.filter((i) => i.status === "EXPIRING_SOON").length,
    issues: MOCK_INTEGRATIONS.filter((i) => i.status === "ERROR" || i.status === "EXPIRED").length,
  };

  return (
    <>
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total integrations" value={counts.total} />
        <StatCard label="Active" value={counts.active} color="green" />
        <StatCard label="Expiring soon" value={counts.expiring} color="yellow" />
        <StatCard label="Needs attention" value={counts.issues} color="red" />
      </div>

      {integrations.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-sm">No integrations match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.slug} integration={integration} />
          ))}
        </div>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "green" | "yellow" | "red";
}) {
  const colorMap: Record<string, string> = {
    green: "text-green-700",
    yellow: "text-yellow-700",
    red: "text-red-700",
  };
  const colorClass = (color !== undefined ? colorMap[color] : undefined) ?? "text-gray-900";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}

export default async function IntegrationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const status = params.status ?? "";
  const category = params.category ?? "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
      </div>

      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>

      <IntegrationGrid q={q} status={status} category={category} />
    </div>
  );
}
