"use client";
import Link from "next/link";
import { useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useRouter } from "next/navigation";
export function UploadForm({ live }: { live: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const data = new FormData(e.currentTarget);
        try {
          const session = await fetch("/api/session", { method: "POST" });
          if (!session.ok) throw new Error((await session.json()).error);
          const r = await fetch("/api/reconcile", {
            method: "POST",
            body: data,
          });
          const result = await r.json();
          if (!r.ok) throw new Error(result.error);
          router.push(`/reports/${result.id}`);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Upload failed. Please try again.",
          );
          setBusy(false);
        }
      }}
    >
      <div className="upload-grid">
        {[
          [
            "purchase",
            "Purchase register",
            "The invoices recorded in your books.",
          ],
          [
            "statement",
            "GSTR-2B",
            "The supplier invoices in your 2B statement.",
          ],
        ].map(([name, label, description]) => (
          <label className="upload" key={name}>
            <FileSpreadsheet size={28} />
            <strong>{label}</strong>
            <span className="muted fine">{description}</span>
            <input
              type="file"
              name={name}
              accept=".csv,.xlsx"
              required
              disabled={busy || !live}
              aria-label={label}
            />
          </label>
        ))}
      </div>
      <p className="fine muted mt-5">
        CSV or XLSX · Up to 2 MB and 5,000 invoices per file · One invoice per
        row
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="actions mt-6">
        {live && (
          <button type="submit" className="btn" disabled={busy}>
            <Upload size={16} />
            {busy ? "Matching your invoices…" : "Run reconciliation"}
          </button>
        )}
        <Link className="btn secondary" href="/reports/demo">
          Run the sample reconciliation
        </Link>
      </div>
      <p role="status" className="fine muted mt-4">
        {busy
          ? "Uploading, matching and saving your report."
          : "Files are processed on the server; raw files are not retained."}
      </p>
    </form>
  );
}
