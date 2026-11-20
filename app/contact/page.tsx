import { SupportForm } from "@/components/support-form";
import Link from "next/link";
export default function Contact() {
  return (
    <article className="wrap prose">
      <div className="eyebrow">Help & data controls</div>
      <h1>A clear way to get help.</h1>
      <section className="card">
        <h2>Product support</h2>
        <p>
          ITCChase is operated by Sayed Zahur. Report a bug, express pilot
          interest or ask a privacy question using the private form below.
        </p>
        <p className="note amber">
          Do not include invoice contents, GSTINs, credentials or session
          cookies. Describe the problem without financial data.
        </p>
        <SupportForm />
      </section>
      <section className="card mt-6">
        <h2>Delete your data</h2>
        <p>
          Open Overview in the same browser session and choose Delete my
          reports. Reports are inaccessible after 30 days; expired records are
          removed on subsequent reconciliation runs.
        </p>
        <Link className="btn secondary" href="/dashboard">
          Manage my reports
        </Link>
      </section>
      <h2>File format help</h2>
      <p>
        Use the downloadable templates on the upload page. Export calculated
        values, combine line items by invoice and enter zero for non-applicable
        taxes. Official exports with nested headers need normalization.
      </p>
      <h2>Pricing and pilot</h2>
      <p>
        First run free. The intended ongoing price is ₹499/month. Paid checkout
        is not active; no payment is collected. We are seeking ten firms for one
        month of assisted reconciliation. Contact through the project support
        channel to express interest without posting financial records.
      </p>
    </article>
  );
}
