# Operations

## Database
Dedicated Neon project summer-flower-77281321, production branch br-curly-frost-bi6pu28c, AWS Singapore. Organization org-sweet-wildflower-67376060 is the authenticated existing organization; no other app uses this project.

For a fresh database, initialize the CLI with your own project, production branch and --no-agent-setup, then run neon deploy. Keep generated env files ignored. Run `npm run db:migrate`, followed once by `node --env-file=.env.local --import tsx scripts/restrict-db.ts`. Migration uses DATABASE_URL_UNPOOLED (admin); the app uses DATABASE_URL (restricted pooled role). Subsequent neon deploy/env pull overwrites DATABASE_URL with provider-generated credentials: restore the restricted runtime URL from your secret manager before restarting or deploying. Never deploy admin credentials.

The deployed runtime role has DML on reports, rate limits and events, and INSERT/DELETE on support requests. It cannot create tables. Production receives only DATABASE_URL and APP_URL; no unpooled owner credential is configured in Vercel. Keep local admin credentials for migrations and reviewing support only.

## Deploy
Use Node 22+ and `npm ci`. Run the checks documented in README, then `vercel link --project itcchase`. Set DATABASE_URL for production through stdin or the Vercel secret UI, set APP_URL to the canonical HTTPS origin, and run `vercel --prod`. Never configure the database URL with NEXT_PUBLIC_. Preview deployments must use a separate Neon branch and secret, not production data. Without a preview database the app provides a synthetic demo and refuses real uploads.

## Data access and retention
A cryptographically random 256-bit HttpOnly session cookie is hashed before ownership lookup. It expires after 30 days; deletion revokes it. There is no account recovery or firm identity verification. Do not share browser profiles. Use complete one-business monthly registers. New browser sessions do not prove new firms or new free-trial eligibility; paid access must use verified accounts before subscriptions launch.

Reports expire logically after 30 days. Expired rows, 90-day events and old rate counters are deleted opportunistically on successful runs, not on a guaranteed daily schedule. Support requests are cleaned on later submissions. For strict physical retention, add scheduled cleanup before making a stronger promise. Provider backups may retain earlier records.

## Support
The private /contact form saves requests in support_requests. The operator must check with admin credentials, respond manually and avoid placing private details in public issues. No email notification service is configured. Review at least daily during the pilot. The app's runtime cannot read the support inbox.

## Recovery
Before a migration, create a schema-only development branch and test it; use production snapshots or a timestamp branch for recovery. The provisioned free project's reported history window is six hours. A restore must be rehearsed before using stronger recovery guarantees; this preview makes none. Keep original accounting files independently. Roll back code with Vercel deployment promotion; restore database changes separately.

## Metrics
1. Target 20 real reconciliations in week one: events where kind = reconciliation_completed and created_at is within the launch week. Exact sample fixtures are excluded. Never treat local test totals as customer usage.
2. Target 10 pilot firms: operator-confirmed business enrollments from support_requests, deduplicated manually. Browser cookies are not firm identities.
3. Target 3 paid firms: verified merchant settlement records once checkout launches. Currently zero; no payment path exists, so this metric cannot advance yet.

Read normalized report counts only as product diagnostics. No analytics page-view receiver is enabled. A paid launch needs a merchant account, verified account identity, recurring payment/webhook integration, access enforcement and cancellation/refund handling. These are intentionally not simulated.
