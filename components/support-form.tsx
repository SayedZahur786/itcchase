"use client";
import { useState } from "react";
export function SupportForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  return done ? (
    <p className="note" role="status">
      Your request was saved for the operator to review. Keep an eye on the
      email address you provided. Replies are not automated.
    </p>
  ) : (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(e.currentTarget);
        try {
          const r = await fetch("/api/support", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              email: form.get("email"),
              message: form.get("message"),
            }),
          });
          const data = await r.json();
          if (!r.ok) throw new Error(data.error);
          setDone(true);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not submit. Please retry.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="block mb-4">
        Your email
        <input
          className="block border rounded p-3 w-full mt-2"
          name="email"
          type="email"
          maxLength={254}
          required
          autoComplete="email"
        />
      </label>
      <label className="block mb-4">
        How can we help?
        <textarea
          className="block border rounded p-3 w-full mt-2"
          name="message"
          minLength={10}
          maxLength={2000}
          required
          rows={4}
        />
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="btn" disabled={busy}>
        {busy ? "Sending…" : "Send support request"}
      </button>
      <p className="fine muted mt-3">
        Email and message are stored privately for operator review. Requests
        expire after 30 days and are deleted on subsequent submissions.
      </p>
    </form>
  );
}
