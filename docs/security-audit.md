# Security self-audit

Reviewer: implementation agent, 21 November 2026. Based on every item in ../launch-kit/checklists/security.md. This is a self-audit, not an independent assessment.

| Checklist item | Result and evidence |
| --- | --- |
| Protected entry inventory / ownership | PASS locally. /dashboard and /reports/[id] use the hashed session owner. /api/reconcile and DELETE /api/reports require a session. Playwright uploads, confirms isolated 404 from another context, deletes and confirms 404 again. No role-bearing client input. |
| Input, files, SQL and least privilege | PASS. 2 MB/file, 5,000 rows, 16 MB archive metadata expansion bound, one invoice table, formulas/macros/external links rejected, bounded strings and integer paise. Component taxes are checked separately. Parameterized SQL; runtime DDL denial verified by scripts/security-check.ts. Versioned SQL migrations. Recovery procedure documented, restore rehearsal not yet performed. |
| Secrets, bundles and history | Verification recorded below after staged and history scans. Env files, Neon context and Vercel state are ignored. Runtime DB imports are server-only. No file content or credentials logged. |
| Durable limits and failures | PASS locally. Neon atomic counters bound session creation, uploads and support. Upload quota remains exhausted when x-forwarded-for changes. Platform-trusted x-vercel-forwarded-for is used only on Vercel; local uses a constant. Storage/rate failures return 503 and deny mutation. No webhooks or payment endpoints exist. |
| Cookies / CSRF / redirects | PASS. 256-bit opaque cookie, HttpOnly, Secure in production, SameSite Strict, 30-day expiry. Cross-origin requests rejected. No user-controlled redirects or cross-origin API permissions. Deletion clears the cookie. |
| Security headers | PASS locally on /, /privacy and /terms, including nonce CSP, nosniff, permissions and referrer policy. HTTPS verification recorded in LAUNCH.md. |
| Dependencies | npm audit reports zero vulnerabilities. Lockfile committed; frozen installation required. Maintained SheetJS 0.20.3 distribution used rather than the obsolete registry package. |
| Shared gates / policy facts | Placeholder, header and policy gates pass locally. Final cold-load performance and deployment results are in LAUNCH.md. Policies disclose actual cookie access, processors, opportunistic deletion, no analytics and unavailable checkout. Legal adequacy has not been independently reviewed. |
| Errors, recovery and accessibility | Logic tests cover invalid dates, negative values, duplicate keys and formula rejection. Browser tests exercise every main route on a 390px viewport with no page overflow. Keyboard labels and shared skip link are present. Error boundaries retry; upload errors remain in the form. Real screenshots captured at desktop/mobile sizes. |

## Payment review
No checkout, payment collection, billing API or webhook is shipped. The ₹499/month offer is labeled planned. Merchant credentials and commercial terms are an owner dependency. Do not claim payment security verification or paid firms.

## Remaining limits
Anonymous session access is not a verified firm account. This is a free pilot, not enforceable paid access. Account recovery, separate preview database configuration, recovery rehearsal and a qualified review before broad commercial use remain operational work. Do not upload credit notes, amendments or files with eligibility classifications expecting full tax treatment.

## Completed scanner evidence
Gitleaks found no leaks in staged application source, staged verification scripts, the three-commit history or .next/static client chunks. npm audit returned zero vulnerabilities. Cold-load performance passed all three runs: 608 / 924 / 792 ms. No scanner proves the absence of every issue.

## Session hardening
Server-side session records enforce expiry independently of cookie expiry. Deletion removes the server session as well as reports. The security script tests replay of revoked and expired tokens, both denied with 401. Database requests have a ten-second timeout and mutation paths fail closed if ownership verification fails.
