"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="wrap">
      <h1>That didn’t load as expected.</h1>
      <p>Please retry. Your last action may not have completed.</p>
      <button className="btn" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
