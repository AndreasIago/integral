export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

// Re-export model types from Prisma 7 generated client
export type {
  Organisation,
  Member,
  Integration,
  SyncJob,
  ApiKey,
  Plan,
  MemberRole,
  IntegrationStatus,
  IntegrationCategory,
  DiscoverySource,
  AuthType,
  JobStatus,
} from "@/app/generated/prisma/client";
