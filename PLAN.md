# ITCChase delivery plan

Primary persona: the owner-bookkeeper of a single-GSTIN small wholesale trader, reconciling a few hundred monthly supplier bills. Core job: turn a purchase-register/2B difference into an accurate supplier-specific request. CA firms may use one business workspace; agency accounts are excluded.

Smallest lovable v1: bounded CSV/XLSX uploads, conservative invoice matching, supplier lists, editable-by-copy WhatsApp/email drafts and month-wise risk summaries. No filing or GSTN integration. First reconciliation free; intended subscription ₹499/month. Payments must remain unavailable until a real merchant account is configured.

## Research — checked 21 November 2026
| Alternative | Capability and price evidence | Complaint evidence and opportunity |
| --- | --- | --- |
| Clear GST | Purchase register vs 2B reconciliation at GSTIN/PAN level. Current fixed price not verified; request vendor quote. [Product](https://cleartax.in/s/gst-reconciliation-software/) and [workflow](https://assets1.cleartax-cdn.com/finfo/wg-utils/retool/d4e95d52-0bf6-4a86-a3f3-335b281fccb6.pdf). | [Community report](https://www.reddit.com/r/IndiaTax/comments/1o13xbi/cleartax_gst_is_shutting_for_small_users_what_is/) alleges small-user availability changes; unverified anecdote, not vendor policy. Opportunity: simple single-business workflow. |
| Zoho Books | Broad accounting, GST and reconciliation. Standard ₹899 monthly or ₹749/month billed annually, excluding taxes. [Pricing](https://www.zoho.com/in/books/pricing/) and [2B export](https://www.zoho.com/in/books/kb/gst/gstr-2b-reconciliation-export.html). | No substantiated product-specific complaint collected. Inference: adopting accounting software is more work than a two-file task; test this rather than presenting it as user testimony. |
| GSTN Matching Offline Tool / CA Excel workflow | Government utility compares downloaded 2B JSON with a prescribed purchase-register spreadsheet. No separate tool fee published. [Official manual](https://tutorial.gst.gov.in/downloads/matchingtool.pdf). Excel macros vary by author; no universal price. | No verified product-specific complaint collected. The manual requires local imports and exports; supplier communication remains a separate workflow. This is a workflow observation, not a customer quote. |

Riskiest assumption: firms will pay for supplier follow-up rather than continue copying from Excel. Cheapest test: offer one month of assisted reconciliation to ten firms, observe draft copying and ask for ₹499 renewal. Week-one targets: 20 real reconciliations, 10 firms trying it, 3 paid firms. Demo events never count.

## Architecture and state
Server-only SheetJS parser -> normalized integer-paise invoices -> deterministic one-to-one matcher -> supplier drafts and month totals. Key: GSTIN + conservative invoice normalization; date tolerance 2 days; ₹1 tax/taxable component tolerance. Ambiguous duplicate invoices are rejected, never silently matched. Risk is a review indicator, not a legal ITC eligibility calculation.

Neon stores session-hashed workspace IDs, monthly reports, durable rate-limit counters and aggregate events; raw uploads are never stored. Opaque HttpOnly session cookie isolates reports. Files: maximum 2 MB each, 5,000 rows, XLSX/CSV only, no macros or formula cells. Preview without database permits synthetic demo only and denies real uploads.

Routes: / landing, /dashboard monthly reports, /reconcile upload, /reports/[id] results and follow-ups, /privacy, /terms, /contact, APIs for session, reports and deletion. Empty states explain next action; loading disables duplicate submission; validation errors are specific without echoing cell content; unexpected errors are generic with retry. No payment collection until verified provider configuration.

## Delivery sequence
1. Initialize isolated repository, document research and decisions.
2. Build parsing/matching tests, schema, privacy-safe session and upload routes, responsive UI.
3. Production build, browser flow and denial tests, dependency/security audits, all four unmodified kit gates.
4. Capture desktop/mobile screenshots and narrated real-product walkthrough, write README and launch drafts.
5. Create/push GitHub and deploy Vercel when credentials work; record exact unresolved external prerequisites.
