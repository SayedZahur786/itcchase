import { notFound } from "next/navigation";
import { demoReport } from "@/lib/demo";
import { getReports } from "@/lib/db";
import { ReportView } from "@/components/report-view";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "demo") return <ReportView report={demoReport()} />;
  if (!/^[a-f0-9-]{36}$/.test(id)) notFound();
  const report = (await getReports()).find((r) => r.id === id);
  if (!report) notFound();
  return <ReportView report={report} />;
}
