# Decisions
- 2026-11-21: Root ignore pattern already excludes all project folders. No root or launch-kit changes needed.
- Primary workspace is a single browser session for one business. Raw uploads are processed in memory; normalized reports are retained 30 days in Neon, with immediate user deletion. Browser-session access is explicitly disclosed; clearing cookies loses access.
- Conservative matching preserves punctuation in invoice numbers, ignores case/outer whitespace, uses two-day date tolerance and one-rupee component tolerance. Duplicate keys fail closed. Negative values/credit notes are unsupported and explicitly rejected.
- Demo uses clearly labeled synthetic invoices, not customer financial data. Demo remains usable if Neon is unavailable; live uploads fail closed without durable storage/rate limits.
- Payment provider and merchant details were not supplied. ₹499/month is intended pricing, not an active checkout. No money is collected and no paid traction is claimed.
- Demo video will be a real Playwright walkthrough with local text-to-speech narration and readable captions: the invoice-to-follow-up flow matters more than a motion promo. No external voice service needed.
- GitHub authentication initially reports an invalid token. Retry once network access is established before declaring a blocker.
