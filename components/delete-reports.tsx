"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function DeleteReports() {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      {confirm ? (
        <div className="actions">
          <span>Delete all reports in this session?</span>
          <button
            className="btn secondary"
            onClick={async () => {
              try {
                const r = await fetch("/api/reports", { method: "DELETE" });
                if (!r.ok) throw new Error();
                router.push("/dashboard");
                router.refresh();
              } catch {
                setError("Deletion failed. Please retry.");
              }
            }}
          >
            Yes, delete reports
          </button>
          <button className="btn secondary" onClick={() => setConfirm(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button className="btn secondary" onClick={() => setConfirm(true)}>
          Delete my reports
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
