import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { MockIntegration } from "@/lib/seed/mock-integrations";
import { Users, Shield, RefreshCw } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  CRM: "CRM",
  COMMUNICATION: "Communication",
  PRODUCTIVITY: "Productivity",
  DEVTOOLS: "Dev Tools",
  ANALYTICS: "Analytics",
  FINANCE: "Finance",
  HR: "HR",
  SECURITY: "Security",
  OTHER: "Other",
};

const SOURCE_LABELS: Record<string, string> = {
  GOOGLE_WORKSPACE: "Google Workspace",
  OKTA: "Okta",
  AZURE_AD: "Azure AD",
  STRIPE_BILLING: "Stripe Billing",
  MANUAL: "Manual",
};

interface IntegrationCardProps {
  integration: MockIntegration;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const logoUrl = integration.metadata["logoUrl"] as string | undefined;
  const initials = integration.name.slice(0, 2).toUpperCase();

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={integration.name} className="h-8 w-8 object-contain" />
            ) : (
              <span className="text-sm font-bold text-gray-500">{initials}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-gray-900 text-sm truncate">{integration.name}</h3>
              <StatusBadge status={integration.status} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {CATEGORY_LABELS[integration.category]} · via {SOURCE_LABELS[integration.source]}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          {integration.seatCount !== undefined && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {integration.activeUsers ?? 0} / {integration.seatCount} seats
            </span>
          )}
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {integration.authType}
          </span>
          {integration.tokenExpiresAt && (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Expires {new Date(integration.tokenExpiresAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Error message */}
        {integration.status === "ERROR" && typeof integration.metadata["errorMessage"] === "string" && (
          <p className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
            {integration.metadata["errorMessage"]}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
