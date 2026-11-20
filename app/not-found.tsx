import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap empty">
      <div className="eyebrow">404 · Not found</div>
      <h1>This page isn’t in your register.</h1>
      <p>
        The address may be incorrect, or this report has expired or belongs to
        another browser session.
      </p>
      <Link className="btn" href="/dashboard">
        Back to your overview
      </Link>
    </div>
  );
}
