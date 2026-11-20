import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Analytics } from "@/components/analytics";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3107"),
  title: {
    default: "ITCChase — Turn missing invoices into follow-ups",
    template: "%s | ITCChase",
  },
  description:
    "Reconcile your purchase register with GSTR-2B, see tax requiring review, and prepare supplier follow-ups.",
  openGraph: {
    title: "ITCChase",
    description:
      "Less spreadsheet chasing. More clarity on your input tax credit.",
    images: ["/og.png"],
  },
};
export const dynamic = "force-dynamic";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header
          name="ITCChase"
          links={[
            { href: "/dashboard", label: "Overview" },
            { href: "/reconcile", label: "Reconcile" },
            { href: "/contact", label: "Help" },
          ]}
        />
        <ErrorBoundary>
          <main id="main">{children}</main>
        </ErrorBoundary>
        <Footer name="Sayed Zahur · ITCChase" year={2026} />
        <Analytics consent={false} />
      </body>
    </html>
  );
}
