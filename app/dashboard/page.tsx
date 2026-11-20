import Link from "next/link";
import { getReports } from "@/lib/db";
import { demoReport } from "@/lib/demo";
import { money, type Report } from "@/lib/match";
import { DeleteReports } from "@/components/delete-reports";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const demo = (await searchParams).demo === "1";
  const reports = demo ? [demoReport()] : await getReports();
  const latest = reports[0];
  const months = new Map<
    string,
    { risk: number; count: number; report: Report }
  >();
  for (const r of reports)
    for (const m of r.months)
      if (!months.has(m.month)) months.set(m.month, { ...m, report: r });
  const total = [...months.values()].reduce((s, m) => s + m.risk, 0);
  return (
    <div className="wrap">
      <div className="topline">
        <div>
          <div className="eyebrow">Your month-end, in focus</div>
          <h1>ITC overview</h1>
          <p className="muted">
            See what needs attention. Keep the supplier conversation moving.
          </p>
        </div>
        <Link href="/reconcile" className="btn">
          New reconciliation
        </Link>
      </div>
      {demo && (
        <div className="note">
          You’re exploring a sample workspace. All invoices and amounts are
          synthetic.{" "}
          <Link className="underline" href="/dashboard">
            Go to your workspace
          </Link>
        </div>
      )}
      {!latest ? (
        <section className="card empty">
          <h2>Your first clear picture starts here.</h2>
          <p className="muted">
            Upload a purchase register and GSTR-2B to see monthly tax requiring
            review and supplier follow-ups.
          </p>
          <div className="actions justify-center">
            <Link className="btn" href="/reconcile">
              Upload your files
            </Link>
            <Link className="btn secondary" href="/dashboard?demo=1">
              Try the sample workspace
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div className="metrics">
            <div className="card metric featured">
              <span className="label">ITC at risk · review estimate</span>
              <strong>{money(total)}</strong>
              <small>Latest report per invoice month</small>
            </div>
            <div className="card metric">
              <span className="label">Missing invoices · latest run</span>
              <strong>
                {latest.findings.filter((f) => f.status === "missing").length}
              </strong>
              <small>Not found in uploaded 2B</small>
            </div>
            <div className="card metric">
              <span className="label">Suppliers to follow up</span>
              <strong>
                {
                  new Set(
                    latest.findings
                      .filter((f) => f.status !== "present")
                      .map((f) => f.invoice.gstin),
                  ).size
                }
              </strong>
              <small>From your latest reconciliation</small>
            </div>
            <div className="card metric">
              <span className="label">Invoices checked · latest run</span>
              <strong>{latest.purchaseCount}</strong>
              <small>Purchase register invoices</small>
            </div>
          </div>
          <div className="grid2">
            <section className="card">
              <div className="section-title">
                <h2>Month-wise tax at risk</h2>
                <span className="pill">By invoice date</span>
              </div>
              <p className="muted fine">
                Each month uses its most recent uploaded report. Upload complete
                monthly registers; partial runs replace that month’s overview.
              </p>
              {[...months]
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, m]) => (
                  <div className="month-row" key={month}>
                    <span>
                      {new Date(month + "-02").toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <svg
                      className="bar"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                      role="img"
                      aria-label={`${money(m.risk)} requiring review`}
                    >
                      <rect width={100} height={10} fill="#e9eeea" />
                      <rect
                        width={
                          (m.risk /
                            Math.max(
                              1,
                              ...[...months.values()].map((x) => x.risk),
                            )) *
                          100
                        }
                        height={10}
                        fill="#4b8166"
                      />
                    </svg>
                    <strong>{money(m.risk)}</strong>
                  </div>
                ))}
              <p className="fine muted">
                Bars compare tax requiring review across uploaded invoice
                months.
              </p>
            </section>
            <section className="card">
              <div className="eyebrow">Your next move</div>
              <h2>Start with a specific ask.</h2>
              <p className="muted">
                Your follow-ups already include invoice numbers, dates and tax
                amounts. Review each draft before sending.
              </p>
              <Link className="btn" href={`/reports/${latest.id}`}>
                Review supplier follow-ups
              </Link>
            </section>
          </div>
          <section className="card mt-6">
            <div className="section-title">
              <h2>Reconciliation history</h2>
              <span className="muted fine">30-day retention</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Run</th>
                    <th>Invoices</th>
                    <th>Tax requiring review</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {r.demo
                          ? "October 2026 · sample"
                          : new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td>{r.purchaseCount}</td>
                      <td>{money(r.totalRisk)}</td>
                      <td>
                        <Link className="underline" href={`/reports/${r.id}`}>
                          View report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          {!demo && (
            <div className="mt-6">
              <DeleteReports />
            </div>
          )}
          <p className="fine muted mt-6">
            ITC at risk is the full tax on missing or mismatched invoices, not a
            legal assessment of eligible credit.
          </p>
        </>
      )}
    </div>
  );
}
