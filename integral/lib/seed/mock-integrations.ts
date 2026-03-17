import type { IntegrationStatus, IntegrationCategory, DiscoverySource, AuthType } from "@/app/generated/prisma/enums";

export interface MockIntegration {
  name: string;
  slug: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  source: DiscoverySource;
  authType: AuthType;
  scopes: string[];
  seatCount?: number;
  activeUsers?: number;
  tokenExpiresAt?: Date;
  metadata: Record<string, unknown>;
}

const now = new Date();
const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

export const MOCK_INTEGRATIONS: MockIntegration[] = [
  {
    name: "Salesforce",
    slug: "salesforce",
    category: "CRM",
    status: "ACTIVE",
    source: "OKTA",
    authType: "OAUTH2",
    scopes: ["api", "refresh_token", "offline_access"],
    seatCount: 150,
    activeUsers: 112,
    tokenExpiresAt: inThirtyDays,
    metadata: { vendor: "Salesforce", logoUrl: "https://logo.clearbit.com/salesforce.com" },
  },
  {
    name: "Slack",
    slug: "slack",
    category: "COMMUNICATION",
    status: "ACTIVE",
    source: "GOOGLE_WORKSPACE",
    authType: "OAUTH2",
    scopes: ["channels:read", "chat:write", "users:read"],
    seatCount: 300,
    activeUsers: 287,
    tokenExpiresAt: inThirtyDays,
    metadata: { vendor: "Slack Technologies", logoUrl: "https://logo.clearbit.com/slack.com" },
  },
  {
    name: "GitHub",
    slug: "github",
    category: "DEVTOOLS",
    status: "ACTIVE",
    source: "OKTA",
    authType: "OAUTH2",
    scopes: ["repo", "read:org", "read:user"],
    seatCount: 80,
    activeUsers: 78,
    tokenExpiresAt: inThirtyDays,
    metadata: { vendor: "GitHub", logoUrl: "https://logo.clearbit.com/github.com" },
  },
  {
    name: "Notion",
    slug: "notion",
    category: "PRODUCTIVITY",
    status: "EXPIRING_SOON",
    source: "GOOGLE_WORKSPACE",
    authType: "OAUTH2",
    scopes: ["read_content", "update_content"],
    seatCount: 200,
    activeUsers: 143,
    tokenExpiresAt: inFiveDays,
    metadata: { vendor: "Notion Labs", logoUrl: "https://logo.clearbit.com/notion.so" },
  },
  {
    name: "Figma",
    slug: "figma",
    category: "DEVTOOLS",
    status: "ACTIVE",
    source: "GOOGLE_WORKSPACE",
    authType: "OAUTH2",
    scopes: ["file_read", "file_content"],
    seatCount: 45,
    activeUsers: 39,
    tokenExpiresAt: inThirtyDays,
    metadata: { vendor: "Figma Inc", logoUrl: "https://logo.clearbit.com/figma.com" },
  },
  {
    name: "Jira",
    slug: "jira",
    category: "DEVTOOLS",
    status: "ACTIVE",
    source: "OKTA",
    authType: "OAUTH2",
    scopes: ["read:jira-work", "write:jira-work"],
    seatCount: 90,
    activeUsers: 67,
    tokenExpiresAt: inThirtyDays,
    metadata: { vendor: "Atlassian", logoUrl: "https://logo.clearbit.com/atlassian.com" },
  },
  {
    name: "HubSpot",
    slug: "hubspot",
    category: "CRM",
    status: "EXPIRED",
    source: "STRIPE_BILLING",
    authType: "OAUTH2",
    scopes: ["contacts", "crm.objects.contacts.read"],
    seatCount: 25,
    activeUsers: 0,
    tokenExpiresAt: threeDaysAgo,
    metadata: { vendor: "HubSpot", logoUrl: "https://logo.clearbit.com/hubspot.com" },
  },
  {
    name: "Zoom",
    slug: "zoom",
    category: "COMMUNICATION",
    status: "ACTIVE",
    source: "GOOGLE_WORKSPACE",
    authType: "OAUTH2",
    scopes: ["meeting:read", "meeting:write"],
    seatCount: 300,
    activeUsers: 201,
    tokenExpiresAt: inThirtyDays,
    metadata: { vendor: "Zoom Video Communications", logoUrl: "https://logo.clearbit.com/zoom.us" },
  },
  {
    name: "Datadog",
    slug: "datadog",
    category: "ANALYTICS",
    status: "ACTIVE",
    source: "MANUAL",
    authType: "API_KEY",
    scopes: [],
    seatCount: 15,
    activeUsers: 12,
    metadata: { vendor: "Datadog", logoUrl: "https://logo.clearbit.com/datadog.com" },
  },
  {
    name: "Workday",
    slug: "workday",
    category: "HR",
    status: "ACTIVE",
    source: "OKTA",
    authType: "SAML",
    scopes: [],
    seatCount: 500,
    activeUsers: 498,
    metadata: { vendor: "Workday", logoUrl: "https://logo.clearbit.com/workday.com" },
  },
  {
    name: "Zendesk",
    slug: "zendesk",
    category: "CRM",
    status: "ERROR",
    source: "OKTA",
    authType: "OAUTH2",
    scopes: ["read", "write"],
    seatCount: 30,
    activeUsers: 0,
    metadata: { vendor: "Zendesk", logoUrl: "https://logo.clearbit.com/zendesk.com", errorMessage: "Token refresh failed — re-authenticate required" },
  },
  {
    name: "Linear",
    slug: "linear",
    category: "DEVTOOLS",
    status: "ACTIVE",
    source: "GOOGLE_WORKSPACE",
    authType: "OAUTH2",
    scopes: ["read", "write"],
    seatCount: 60,
    activeUsers: 54,
    tokenExpiresAt: inThirtyDays,
    metadata: { vendor: "Linear", logoUrl: "https://logo.clearbit.com/linear.app" },
  },
];
