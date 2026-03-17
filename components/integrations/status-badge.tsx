import { Badge } from "@/components/ui/badge";
import type { IntegrationStatus } from "@/app/generated/prisma/enums";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<IntegrationStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-green-100 text-green-800 border-green-200" },
  EXPIRING_SOON: { label: "Expiring soon", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  EXPIRED: { label: "Expired", className: "bg-red-100 text-red-800 border-red-200" },
  ERROR: { label: "Error", className: "bg-red-100 text-red-800 border-red-200" },
  DISCONNECTED: { label: "Disconnected", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

export function StatusBadge({ status }: { status: IntegrationStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
