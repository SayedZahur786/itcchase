"use client";
import { useState } from "react";
import { type Report, type Finding, money, supplierMessage } from "@/lib/match";
import Link from "next/link";
export function ReportView({ report }: { report: Report }) {
  const [filter, setFilter] = useState("attention");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const attention = report.findings.filter((f) => f.status !== "present");
  const groups = Map.groupBy(attention, (f) => f.invoice.gstin);
  const counts = {
    present: report.findings.filter((f) => f.status === "present").length,
    missing: report.findings.filter((f) => f.status === "missing").length,
    mismatched: report.findings.filter((f) => f.status === "mismatched").length,
  };
  async function copy(gstin: string, items: Finding[]) {
    try {
      await navigator.clipboard.writeText(supplierMessage(items));
      setCopied(gstin);
      setError("");
    } catch {
      setError(
        "Clipboard access is unavailable. Select and copy the draft text below.",
      );
    }
  }
  return (
    <div className="wrap">
      <div className="topline">
        <div>
          <div className="eyebrow">Reconciliation results</div>
          <h1>A clear list. A useful next step.</h1>
          <p className="muted">
            {report.purchaseCount} purchase invoices checked against{" "}
            {report.statementCount} GSTR-2B invoices.
          </p>
        </div>
        <Link href="/reconcile" className="btn secondary">
          New reconciliation
        </Link>
      </div>
      {report.demo && (
        <div className="note">
          Demo workspace · 50 synthetic purchase invoices and 46 GSTR-2B
          invoices. No real customer data.
        </div>
      )}
      <div className="metrics">
        <div className="card metric featured">
          <span className="label">Tax requiring review</span>
          <strong>{money(report.totalRisk)}</strong>
          <small>Missing + mismatched invoice tax</small>
        </div>
        {(["present", "missing", "mismatched"] as const).map((s) => (
          <div className="card metric" key={s}>
            <span className="label">
              {s === "present"
                ? "Present in 2B"
                : s === "missing"
                  ? "Missing in 2B"
                  : "Mismatched"}
            </span>
            <strong data-testid={s + "-count"}>{counts[s]}</strong>
            <small>
              {s === "present"
                ? "Within matching tolerance"
                : "Needs your review"}
            </small>
          </div>
        ))}
      </div>
      <div className="note amber">
        Review indicator, not a claimable ITC calculation. Missing invoices may
        appear in a later period. Mismatches flag the full purchase tax for
        review; confirm eligibility with your tax adviser.
      </div>
      <section className="card">
        <div className="section-title">
          <h2>Invoice review</h2>
          <span className="muted fine">
            GSTIN + invoice number · ±2 days · ₹1 tolerance
          </span>
        </div>
        <div className="tabs">
          {[
            ["attention", "Needs attention"],
            ["all", "All invoices"],
            ["present", "Present"],
            ["missing", "Missing"],
            ["mismatched", "Mismatched"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Supplier / GSTIN</th>
                <th>Invoice</th>
                <th>Status</th>
                <th>Tax at risk</th>
                <th>Review note</th>
              </tr>
            </thead>
            <tbody>
              {report.findings
                .filter(
                  (f) =>
                    filter === "all" ||
                    (filter === "attention"
                      ? f.status !== "present"
                      : f.status === filter),
                )
                .map((f) => (
                  <tr key={f.invoice.gstin + f.invoice.number}>
                    <td>
                      {f.invoice.supplier}
                      <small>{f.invoice.gstin}</small>
                    </td>
                    <td>
                      {f.invoice.number}
                      <small>{f.invoice.date}</small>
                    </td>
                    <td>
                      <span className={`pill ${f.status}`}>{f.status}</span>
                    </td>
                    <td>{money(f.risk)}</td>
                    <td>
                      {f.reason}
                      {f.counterpart && f.status === "mismatched" && (
                        <small>
                          2B date: {f.counterpart.date}; taxable:{" "}
                          {money(f.counterpart.taxable)}; IGST:{" "}
                          {money(f.counterpart.igst)}; CGST:{" "}
                          {money(f.counterpart.cgst)}; SGST:{" "}
                          {money(f.counterpart.sgst)}; cess:{" "}
                          {money(f.counterpart.cess)}
                        </small>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!attention.length && filter === "attention" && (
          <p className="note">
            All purchase invoices agree within the configured tolerance.
          </p>
        )}
        {report.extra.length > 0 && (
          <details>
            <summary>
              {report.extra.length} invoices appear only in GSTR-2B
            </summary>
            {report.extra.map((i) => (
              <p key={i.gstin + i.number}>
                {i.supplier} · {i.number} · {i.date}
              </p>
            ))}
          </details>
        )}
      </section>
      <section className="mt-8">
        <div className="section-title">
          <div>
            <div className="eyebrow">From reconciliation to conversation</div>
            <h2>Ready for your suppliers</h2>
          </div>
          <span className="muted fine">
            {groups.size} suppliers need a follow-up
          </span>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {[...groups].map(([gstin, items]) => (
          <article className="card supplier-card" key={gstin}>
            <div className="section-title">
              <div>
                <h3>{items[0].invoice.supplier}</h3>
                <span className="muted fine">
                  {gstin} · {items.length} invoice
                  {items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <strong>{money(items.reduce((s, f) => s + f.risk, 0))}</strong>
            </div>
            <pre className="draft">{supplierMessage(items)}</pre>
            <div className="actions">
              <button className="btn" onClick={() => copy(gstin, items)}>
                {copied === gstin ? "Copied message" : "Copy follow-up"}
              </button>
              <a
                className="btn secondary"
                href={`https://wa.me/?text=${encodeURIComponent(supplierMessage(items))}`}
                target="_blank"
                rel="noreferrer"
              >
                Open WhatsApp
              </a>
              <a
                className="btn secondary"
                href={`mailto:?subject=${encodeURIComponent("Invoice follow-up: GSTR-2B review")}&body=${encodeURIComponent(supplierMessage(items))}`}
              >
                Open email draft
              </a>
            </div>
            <span role="status" className="sr-only">
              {copied === gstin ? "Supplier follow-up copied." : ""}
            </span>
          </article>
        ))}
      </section>
    </div>
  );
}
