# CLAUDE.md — Integral

This file is read by Claude Code at the start of every session.
Follow every instruction here unless explicitly overridden in the current session prompt.

---

## Product overview

**Integral** — a multi-tenant SaaS that discovers, displays, and manages all of a
company's third-party API integrations in one place. Customers connect their identity
provider (Google Workspace, Okta, Azure AD) and the product surfaces every OAuth-connected
tool, its health status, seat usage, and token expiry. An AI assistant answers natural-
language questions about the customer's stack.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | SSR dashboard + API route handlers for OAuth callbacks |
| Language | TypeScript (strict mode) | No `any` types — ever |
| Styling | Tailwind CSS + shadcn/ui | Component library, design tokens from Figma |
| ORM | Prisma | Type-safe queries, managed migrations |
| Database | Supabase (Postgres) | RLS for tenant isolation, Auth, Realtime, Storage |
| Vector DB | Pinecone | Semantic search over integration metadata |
| AI | Anthropic API + Vercel AI SDK | In-product assistant, streaming tool calls |
| Payments | Stripe | Per-seat subscriptions, usage billing |
| Email | Resend | Transactional — onboarding, token expiry alerts |
| Analytics | PostHog | Product analytics, feature flags |
| Errors | Sentry | Runtime error tracking |
| Deploy | Vercel | Preview environments per PR, production |
| CI | GitHub Actions | Lint, type-check, test on every PR |

---

## MCP servers (Claude Code session config)

These are active in every Claude Code session. Use them — don't reinvent what they provide.

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": { "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}" }
    },
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-mcp"],
      "env": { "FIGMA_TOKEN": "${FIGMA_TOKEN}" }
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp-server"],
      "env": { "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}" }
    },
    "resend": {
      "command": "npx",
      "args": ["-y", "resend-mcp"],
      "env": { "RESEND_API_KEY": "${RESEND_API_KEY}" }
    },
    "posthog": {
      "command": "npx",
      "args": ["-y", "posthog-mcp"],
      "env": { "POSTHOG_API_KEY": "${POSTHOG_API_KEY}" }
    },
    "sentry": {
      "command": "npx",
      "args": ["-y", "sentry-mcp"],
      "env": { "SENTRY_AUTH_TOKEN": "${SENTRY_AUTH_TOKEN}" }
    },
    "integral-discovery": {
      "command": "node",
      "args": ["./mcp-server/index.js"],
      "env": {}
    }
  }
}
```

---

## Project structure

```
/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages — login, signup, callback
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── integrations/       # Main integration list
│   │   ├── assistant/          # AI chat interface
│   │   ├── settings/           # Org settings, billing, team
│   │   └── layout.tsx          # Dashboard shell + nav
│   └── api/
│       ├── auth/               # Supabase auth callbacks
│       ├── integrations/       # Discovery trigger, sync endpoints
│       ├── assistant/          # AI streaming endpoint
│       └── webhooks/           # Stripe, Sentry webhooks
├── components/
│   ├── ui/                     # shadcn primitives (never edit directly)
│   ├── integrations/           # IntegrationCard, StatusBadge, FilterBar
│   ├── assistant/              # ChatWindow, MessageBubble, ToolCallDisplay
│   └── layout/                 # Sidebar, TopNav, OrgSwitcher
├── lib/
│   ├── supabase/               # Client, server, middleware helpers
│   ├── prisma/                 # Prisma client singleton
│   ├── ai/                     # Anthropic client, system prompt, tools
│   ├── discovery/              # OAuth crawl logic, connector registry
│   └── stripe/                 # Billing helpers, plan limits
├── mcp-server/                 # Custom discovery MCP server
│   ├── index.js                # MCP server entry point
│   ├── connectors/             # One file per integration source
│   │   ├── google-workspace.ts
│   │   ├── okta.ts
│   │   ├── azure-ad.ts
│   │   └── stripe-billing.ts   # Detect tools via expense data
│   └── tools/                  # MCP tool definitions
├── prisma/
│   ├── schema.prisma           # Source of truth for data model
│   └── migrations/             # Never edit manually
├── hooks/                      # React hooks (useIntegrations, useAssistant)
├── types/                      # Shared TypeScript types
└── CLAUDE.md                   # This file
```

---

## Data model (Prisma schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Organisation {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  plan          Plan     @default(FREE)
  stripeCustomerId String? @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  members       Member[]
  integrations  Integration[]
  syncJobs      SyncJob[]
  apiKeys       ApiKey[]
}

model Member {
  id     String     @id @default(cuid())
  userId String
  orgId  String
  role   MemberRole @default(VIEWER)

  org    Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@unique([userId, orgId])
}

model Integration {
  id            String            @id @default(cuid())
  orgId         String
  name          String            // "Salesforce", "Notion", "Figma"
  slug          String            // "salesforce", "notion", "figma"
  category      IntegrationCategory
  status        IntegrationStatus @default(ACTIVE)
  source        DiscoverySource   // how it was found
  authType      AuthType          // oauth2, api_key, saml
  scopes        String[]          // OAuth scopes granted
  seatCount     Int?              // licensed seats if known
  activeUsers   Int?              // users who accessed in last 30 days
  lastSyncedAt  DateTime?
  tokenExpiresAt DateTime?
  metadata      Json              @default("{}")
  embeddingId   String?           // Pinecone vector ID for AI search
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  org           Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@unique([orgId, slug])
  @@index([orgId, status])
}

model SyncJob {
  id          String      @id @default(cuid())
  orgId       String
  status      JobStatus   @default(PENDING)
  source      DiscoverySource
  startedAt   DateTime?
  completedAt DateTime?
  error       String?
  result      Json?

  org         Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)
}

model ApiKey {
  id        String   @id @default(cuid())
  orgId     String
  name      String
  keyHash   String   @unique
  lastUsed  DateTime?
  expiresAt DateTime?
  createdAt DateTime @default(now())

  org       Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)
}

enum Plan {
  FREE
  STARTER
  GROWTH
  ENTERPRISE
}

enum MemberRole {
  OWNER
  ADMIN
  VIEWER
}

enum IntegrationStatus {
  ACTIVE
  EXPIRING_SOON  // token expires within 14 days
  EXPIRED
  ERROR
  DISCONNECTED
}

enum IntegrationCategory {
  CRM
  COMMUNICATION
  PRODUCTIVITY
  DEVTOOLS
  ANALYTICS
  FINANCE
  HR
  SECURITY
  OTHER
}

enum DiscoverySource {
  GOOGLE_WORKSPACE
  OKTA
  AZURE_AD
  STRIPE_BILLING
  MANUAL
}

enum AuthType {
  OAUTH2
  API_KEY
  SAML
  BASIC
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

---

## Security rules — read before every write operation

### Multi-tenancy (CRITICAL)

- Every database query MUST filter by `orgId`. No exceptions.
- Prisma Client must always be called with the anon key (not service role) so RLS applies.
- Never use `supabaseAdmin` (service role client) for queries that return user data.
- `supabaseAdmin` is only used for: creating orgs on signup, webhook handlers, background jobs.
- Every new Supabase table needs an RLS policy. Ask before creating a table without one.

```sql
-- Template RLS policy — apply to every table with orgId
ALTER TABLE "Integration" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON "Integration"
  USING (
    "orgId" IN (
      SELECT org_id FROM members WHERE user_id = auth.uid()
    )
  );
```

### Secrets and credentials

- Never log tokens, API keys, or OAuth credentials — not even in dev.
- OAuth tokens for customer integrations are encrypted at rest in Supabase Vault.
- Never store raw tokens in the `Integration` table — store only metadata and vault references.
- `.env.local` is gitignored. Never commit secrets. Never hardcode them.

### API routes

- Every API route under `/api/integrations/` and `/api/assistant/` requires a valid
  Supabase session. Use `createServerClient` and check `session` before any operation.
- Rate limit all AI assistant endpoints: 20 requests/minute per org on FREE, 100 on STARTER+.
- Validate and sanitise all user input with Zod before it touches the database.

---

## Coding conventions

### TypeScript

- Strict mode on. No `any`. Use `unknown` and narrow it.
- Zod for all external data validation (API responses, form inputs, webhook payloads).
- Prefer `Result<T, E>` pattern over throwing for expected errors.

### Components

- All new UI components go in `components/` — never inline complex JSX in page files.
- Use shadcn primitives from `components/ui/` — never style them directly, wrap them.
- Every data-fetching component gets a `loading` and `error` state.
- Use `React.Suspense` + skeleton loaders for async dashboard data, not spinners.

### API routes

```typescript
// Standard API route pattern
export async function GET(req: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const orgId = session.user.user_metadata.orgId
  // orgId is always present — enforced at signup
  // all queries use orgId — RLS is a second layer, not the first
}
```

### Git workflow

- Branch naming: `feat/`, `fix/`, `chore/` prefixes.
- Every feature branch gets a Vercel preview deploy automatically.
- PRs require passing CI (lint + typecheck + tests) before merge.
- Use the GitHub MCP to open PRs — include a clear description of what changed and why.

---

## AI assistant (in-product)

The assistant inside the product is powered by the Anthropic API. It has access to tools
that query the customer's integration data. It must only ever access data for the current
organisation — pass `orgId` into every tool call and validate it server-side.

### System prompt skeleton

```
You are the Integral assistant. You help {orgName}'s team understand and manage
their software integrations.

You have access to tools that can:
- List all integrations and their status
- Search integrations by name, category, or status
- Show seat usage and cost estimates
- Identify expiring or unused integrations
- Trigger a re-sync of the integration discovery

You must only access data for orgId: {orgId}.
Be concise. Use plain language. When showing lists, limit to 10 items and offer to show more.
Never guess — if you don't have data, say so and offer to run a sync.
```

### Tool definitions (Vercel AI SDK)

```typescript
const tools = {
  listIntegrations: tool({
    description: 'List integrations for the current org, optionally filtered',
    parameters: z.object({
      status: z.enum(['ACTIVE','EXPIRING_SOON','EXPIRED','ERROR']).optional(),
      category: z.string().optional(),
      limit: z.number().default(10),
    }),
    execute: async ({ status, category, limit }) => {
      // orgId injected server-side — never from client
      return prisma.integration.findMany({ where: { orgId, status, category }, take: limit })
    }
  }),
  searchIntegrations: tool({
    description: 'Semantic search over integrations using natural language',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      // embed query → search Pinecone → return matching integrations
    }
  }),
  triggerSync: tool({
    description: 'Start a new integration discovery sync for the org',
    parameters: z.object({ source: z.enum(['GOOGLE_WORKSPACE','OKTA','AZURE_AD','ALL']) }),
    execute: async ({ source }) => {
      // enqueue sync job — return job ID
    }
  }),
}
```

---

## Custom MCP server (discovery engine)

Located at `./mcp-server/`. This is the core IP of the product.

### What it does

Crawls the customer's identity provider and billing data to discover all connected
third-party tools. Runs on demand (user-triggered) and on a nightly schedule.

### Adding a new connector

1. Create `mcp-server/connectors/{provider}.ts`
2. Implement the `Connector` interface:

```typescript
interface Connector {
  source: DiscoverySource
  discover(credentials: ConnectorCredentials): Promise<DiscoveredIntegration[]>
  healthCheck(integration: Integration): Promise<IntegrationStatus>
}
```

3. Register it in `mcp-server/connectors/index.ts`
4. Add the OAuth scopes required to `lib/discovery/scopes.ts`
5. Write a test in `mcp-server/connectors/__tests__/{provider}.test.ts`

### Priority connector order (build in this sequence)

1. Google Workspace Admin SDK — broadest coverage for SMB customers
2. Okta — covers mid-market
3. Azure AD — covers Microsoft-first companies
4. Stripe billing export — catches tools missed by SSO

---

## Build phases

### Phase 1 — Foundation (do this first)

- [ ] Init Next.js 14 with TypeScript strict, Tailwind, shadcn
- [ ] Set up Supabase project, run initial Prisma migration
- [ ] Implement auth flow (signup → org creation → dashboard redirect)
- [ ] Build dashboard shell: sidebar nav, top bar, org switcher
- [ ] Seed with mock integration data to develop against

### Phase 2 — Discovery engine

- [ ] Build custom MCP server skeleton
- [ ] Implement Google Workspace connector (OAuth Admin SDK)
- [ ] Build integration list UI (IntegrationCard, StatusBadge, FilterBar)
- [ ] Implement nightly sync cron (Vercel Cron or Supabase Edge Function)
- [ ] Token expiry detection + Resend alert email

### Phase 3 — AI assistant

- [ ] Set up Anthropic API client and system prompt
- [ ] Implement streaming chat API route with Vercel AI SDK
- [ ] Build chat UI (ChatWindow, MessageBubble, streaming indicator)
- [ ] Implement listIntegrations + searchIntegrations tools
- [ ] Embed integration metadata into Pinecone on sync

### Phase 4 — Commerce

- [ ] Set up Stripe products: Free, Starter (£49/mo), Growth (£149/mo)
- [ ] Build pricing page and Stripe Checkout flow
- [ ] Implement plan limits (integration count, seat count, sync frequency)
- [ ] Stripe webhook handler (subscription created/cancelled/updated)
- [ ] Resend onboarding email sequence (welcome, day 3 tip, day 7 check-in)

### Phase 5 — Production ready

- [ ] RLS policy audit — every table, every policy
- [ ] Sentry error tracking on all API routes and the MCP server
- [ ] Rate limiting on assistant endpoint (Upstash Redis)
- [ ] PostHog events: integration_discovered, assistant_query, sync_triggered
- [ ] Load test discovery engine with 500+ integrations
- [ ] Vercel production deploy, custom domain, SSL

---

## Things Claude Code must ask before doing

- Dropping or renaming a database column
- Changing an RLS policy
- Adding a new OAuth scope to a connector
- Modifying the Stripe webhook handler
- Deleting any file outside of `node_modules` or `.next`
- Changing the Prisma schema in a way that requires a destructive migration

---

## Useful commands

```bash
# Dev
pnpm dev                          # Start Next.js dev server
pnpm prisma studio                # Visual DB browser
pnpm prisma migrate dev           # Apply schema changes in dev
node mcp-server/index.js          # Run discovery MCP server locally

# Quality
pnpm lint                         # ESLint
pnpm typecheck                    # tsc --noEmit
pnpm test                         # Vitest

# Deploy
pnpm prisma migrate deploy        # Apply migrations in production (CI only)
vercel --prod                     # Manual production deploy (prefer CI)
```
