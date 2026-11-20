import Link from "next/link";
import { Files, ListChecks, MessageSquare } from "lucide-react";
import { demoReport } from "@/lib/demo";
import { money } from "@/lib/match";
export default function Home() {
  const demo = demoReport();
  return (
    <div className="wrap">
      <section className="hero">
        <div>
          <div className="eyebrow">A clearer month-end for your business</div>
          <h1>
            Your ITC needs
            <br />a follow-up.
            <br />
            <span className="muted">Not another sheet.</span>
          </h1>
          <p className="muted">
            Match your purchase register with GSTR-2B. Find the missing
            invoices. Give every supplier a clear message to act on.
          </p>
          <div className="actions">
            <Link href="/reconcile" className="btn">
              Reconcile your invoices
            </Link>
            <Link href="/dashboard?demo=1" className="btn secondary">
              Explore the demo
            </Link>
          </div>
          <p className="hero-note">
            First run free · Planned subscription ₹499/month
            <br />
            Early preview · No payment collected
          </p>
        </div>
        <div className="card sample-card">
          <div className="section-title">
            <span className="eyebrow">October reconciliation</span>
            <span className="pill">Sample data</span>
          </div>
          <p className="muted fine">Tax requiring a closer look</p>
          <div className="sample-total">{money(demo.totalRisk)}</div>
          <p className="fine muted">
            4 missing invoices. Four conversations to start.
          </p>
          {demo.findings
            .filter((f) => f.status === "missing")
            .slice(0, 3)
            .map((f) => (
              <div className="sample-row" key={f.invoice.number}>
                <div>
                  <strong>{f.invoice.supplier}</strong>
                  <br />
                  <span className="muted">{f.invoice.number}</span>
                </div>
                <div>
                  {money(f.risk)}
                  <br />
                  <span className="pill missing">Missing in 2B</span>
                </div>
              </div>
            ))}
          <Link className="btn secondary" href="/reports/demo">
            See the supplier follow-ups
          </Link>
        </div>
      </section>
      <section className="flow">
        {[
          {
            icon: Files,
            title: "Two files. One clear picture.",
            text: "Upload your purchase register and GSTR-2B as CSV or Excel. Start with our supported column templates.",
          },
          {
            icon: ListChecks,
            title: "Know what needs attention.",
            text: "See present, missing and mismatched invoices, with tax requiring review grouped by supplier and month.",
          },
          {
            icon: MessageSquare,
            title: "Make the next conversation easy.",
            text: "Copy a specific follow-up, or open it in WhatsApp or email. Review it before you send.",
          },
        ].map((x) => (
          <div className="card" key={x.title}>
            <span className="flow-icon">
              <x.icon size={22} />
            </span>
            <h2>{x.title}</h2>
            <p className="muted">{x.text}</p>
          </div>
        ))}
      </section>
      <div className="brand-block">
        <h2>Built for the person doing the chasing.</h2>
        <p>
          One business. One register. No accounting-system migration.
          <br />
          ITCChase flags differences for review; it does not file returns or
          decide tax eligibility.
        </p>
      </div>
    </div>
  );
}
