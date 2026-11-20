# ITCChase launch

Status: free pilot preview. Source repository is private. Paid subscriptions are not available. No customer results or traction are claimed.

## Gate results — 21 November 2026
- PASS placeholder-scan: authored application, tests and docs contain no listed filler patterns.
- PASS header-check locally: nonce CSP and required headers on /, /privacy and /terms. Production HTTPS verification follows deployment.
- PASS policy-check locally: distinct substantive privacy and terms rendered successfully. This is not legal certification.
- PASS perf-check: cold mobile LCP 608 / 924 / 792 ms; worst 924 ms, below 2,500 ms, with 4× CPU slowdown and 1.6 Mbps / 150 ms network. Local lab result, not production field performance.
- PASS: 8 unit/parser tests, 3 browser tests including actual two-file upload, four missing invoices, clipboard, cross-session denial, deletion and all main mobile routes.
- PASS: strict TypeScript, ESLint, production build, npm audit (zero vulnerabilities), durable-rate/invalid-input/runtime-permission checks.
- PASS: Gitleaks staged source, three-commit history and production client chunks. Final documentation checked again before push.
- PASS: desktop and mobile screenshot capture; 54-second H.264/AAC MP4 with local narration and burned-in captions.

## Human needed
1. Provide a merchant account and approved billing/refund terms before paid checkout can be implemented. No payment keys were supplied. Paid access also needs verified firm accounts and subscription enforcement; the current anonymous browser pilot deliberately does not simulate them.
2. Approve public GitHub visibility if desired. Automatic approval review rejected public creation because visibility was not explicit; the private repository was created successfully.
3. Post the reviewed outreach below in groups where you have permission, invite ten firms and review incoming support requests daily. No messages were sent by the agent.
4. If a separate Neon organization is mandatory, create it in the owner console and move this dedicated project. The CLI had no organization-creation endpoint; project isolation is already in place within the authenticated organization.

## Week-one scorecard
- **20 real reconciliations:** count reconciliation_completed in Neon events for the launch week. Synthetic sample uploads are excluded.
- **10 pilot firms:** manually verified and deduplicated enrollments from the private support inbox, not cookie counts.
- **3 paid firms:** confirmed merchant settlements after billing is activated. Current baseline: zero paid firms; no checkout exists.

## CA / trader WhatsApp group draft
I built ITCChase for the part after GSTR-2B reconciliation: following up with suppliers.

Upload your purchase register and 2B table, review missing or mismatched invoices, then copy a supplier-specific WhatsApp or email draft with invoice numbers and amounts.

I’m inviting 10 firms to try an assisted reconciliation of one month for free. The intended ongoing price is ₹499/month; paid checkout is not active yet. This preview needs the supported column format and does not file returns or decide ITC eligibility.

Try the synthetic demo: https://itcchase.vercel.app
Express interest privately: https://itcchase.vercel.app/contact
Please don’t share financial files in this group. I’d value feedback on whether the supplier follow-up actually saves you work.

## LinkedIn group draft
Month-end reconciliation produces a list. Someone still has to turn that list into supplier conversations.

I built ITCChase to make that handoff easier for small traders: upload the purchase register and GSTR-2B, review missing/mismatched invoices, see month-wise tax requiring review and prepare a specific message for each supplier.

The live demo uses 50 synthetic purchase invoices with four missing in 2B. Those are test figures, not customer savings. I’m inviting 10 firms for a free assisted reconciliation of one month and feedback on the follow-up workflow.

This is an early preview: normalized CSV/XLSX input, no filing or GSTN integration, no agency accounts. ₹499/month is the planned price; subscriptions are not yet sold.

Try it: https://itcchase.vercel.app
Contact: https://itcchase.vercel.app/contact
What detail would make a supplier more likely to act on your reconciliation message?

## Short launch thread draft
1. ITCChase turns purchase-register and GSTR-2B differences into supplier-specific follow-ups. Built for the person doing the chasing.
2. Upload two files, review the missing invoices and copy a useful message. The demo uses synthetic data: 50 purchase invoices, four missing in 2B.
3. Free pilot for 10 firms. Planned ₹499/month; no paid checkout yet. Normalized files required; no filing or eligibility decisions. https://itcchase.vercel.app

## Show HN draft
Title: Show HN: ITCChase – Supplier follow-ups from GSTR-2B differences
URL: https://itcchase.vercel.app

ITCChase connects two familiar steps: invoice reconciliation and asking suppliers about the differences. It uses conservative matching, integer-paise totals, bounded server-side Excel parsing and browser-session isolation in a dedicated Neon project.

It’s a free early pilot with a synthetic demo, not a proven tax-savings product. I’m looking for ten firms to test one month’s workflow. Normalized tables are required; filing, GSTN integration and credit-note treatment are outside this version.
