import { UploadForm } from "@/components/upload-form";
export default function Reconcile() {
  const live = !!process.env.DATABASE_URL;
  return (
    <div className="wrap">
      <div className="eyebrow">Bring the two sides together</div>
      <h1>Let’s find what’s missing.</h1>
      <p className="muted">
        Upload the same period from your books and GSTR-2B. We’ll prepare the
        follow-ups.
      </p>
      {!live && (
        <div className="note amber">
          Live uploads are awaiting database activation. You can explore the
          complete sample reconciliation below. No files will be uploaded in
          demo mode.
        </div>
      )}
      <section className="card mt-7">
        <div className="section-title">
          <h2>Your reconciliation files</h2>
          <span className="pill">First run free</span>
        </div>
        <UploadForm live={live} />
      </section>
      <div className="grid2 mt-6">
        <section className="card">
          <h2>A small check before you start</h2>
          <p className="muted fine">
            Use columns: GSTIN, Supplier, Invoice Number, Invoice Date, Taxable
            Value, IGST, CGST, SGST, Cess. Dates: YYYY-MM-DD or DD/MM/YYYY.
            Enter zero for non-applicable taxes.
          </p>
          <p className="muted fine">
            Normalize multi-row official 2B exports into this format. Combine
            invoice line items. Credit notes, amendments, reverse-charge
            classification and eligibility rules are outside this preview.
          </p>
          <div className="actions">
            <a
              className="btn secondary"
              href="/demo/purchase-register.csv"
              download
            >
              Purchase CSV · 50 rows
            </a>
            <a className="btn secondary" href="/demo/gstr-2b.xlsx" download>
              GSTR-2B Excel · 46 rows
            </a>
          </div>
        </section>
        <section className="card">
          <h2>Your data, kept deliberately small.</h2>
          <p className="muted fine">
            Reports belong to this browser session and expire after 30 days.
            Delete them at any time from Overview. Clearing cookies loses
            access; no account recovery is available in this preview.
          </p>
          <p className="muted fine">
            Early pilot access is free. The planned ongoing price is ₹499/month;
            subscriptions are not yet sold.
          </p>
        </section>
      </div>
    </div>
  );
}
