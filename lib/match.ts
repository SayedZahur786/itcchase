export type Invoice = {
  gstin: string;
  supplier: string;
  number: string;
  date: string;
  taxable: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
};
export type Finding = {
  invoice: Invoice;
  status: "present" | "missing" | "mismatched";
  reason: string;
  risk: number;
  counterpart?: Invoice;
};
export type Report = {
  id: string;
  createdAt: string;
  demo: boolean;
  findings: Finding[];
  extra: Invoice[];
  months: { month: string; risk: number; count: number }[];
  totalRisk: number;
  purchaseCount: number;
  statementCount: number;
};
export const money = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
export const tax = (i: Invoice) => i.igst + i.cgst + i.sgst + i.cess;
const key = (i: Invoice) =>
  `${i.gstin.trim().toUpperCase()}|${i.number.trim().toUpperCase()}`;
export function reconcile(
  purchases: Invoice[],
  statement: Invoice[],
  demo = false,
): Report {
  for (const list of [purchases, statement]) {
    const seen = new Set<string>();
    for (const i of list) {
      if (seen.has(key(i)))
        throw new Error(
          "Duplicate GSTIN and invoice number. Combine line items into one invoice or split financial years before uploading.",
        );
      seen.add(key(i));
    }
  }
  const byKey = new Map(statement.map((i) => [key(i), i]));
  const findings: Finding[] = purchases.map((invoice) => {
    const counterpart = byKey.get(key(invoice));
    if (!counterpart)
      return {
        invoice,
        status: "missing",
        reason: "Not found in this GSTR-2B file",
        risk: tax(invoice),
      };
    byKey.delete(key(invoice));
    const dateMismatch =
      Math.abs(Date.parse(invoice.date) - Date.parse(counterpart.date)) >
      2 * 86400000;
    const amountMismatch = (
      ["taxable", "igst", "cgst", "sgst", "cess"] as const
    ).some((k) => Math.abs(invoice[k] - counterpart[k]) > 100);
    if (dateMismatch || amountMismatch)
      return {
        invoice,
        counterpart,
        status: "mismatched",
        reason: [
          dateMismatch && "Invoice dates differ by more than 2 days",
          amountMismatch &&
            "Taxable value or tax components differ by more than ₹1",
        ]
          .filter(Boolean)
          .join("; "),
        risk: tax(invoice),
      };
    return {
      invoice,
      counterpart,
      status: "present",
      reason: "GSTIN, invoice number, date and amounts agree within tolerance",
      risk: 0,
    };
  });
  const months = new Map<
    string,
    { month: string; risk: number; count: number }
  >();
  for (const f of findings) {
    const month = f.invoice.date.slice(0, 7);
    const m = months.get(month) ?? { month, risk: 0, count: 0 };
    m.risk += f.risk;
    m.count++;
    months.set(month, m);
  }
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    demo,
    findings,
    extra: [...byKey.values()],
    months: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)),
    totalRisk: findings.reduce((s, f) => s + f.risk, 0),
    purchaseCount: purchases.length,
    statementCount: statement.length,
  };
}
export function supplierMessage(findings: Finding[]) {
  const first = findings[0];
  if (!first) return "";
  return `Hello ${first.invoice.supplier},\n\nWe are reviewing our purchase register against GSTR-2B for ${[...new Set(findings.map((f) => f.invoice.date.slice(0, 7)))].join(", ")}. Please check these invoices for GSTIN ${first.invoice.gstin}:\n\n${findings.map((f) => `• ${f.invoice.number} | ${f.invoice.date} | Tax ${money(tax(f.invoice))} | ${f.status}: ${f.reason}`).join("\n")}\n\nTotal tax requiring review: ${money(findings.reduce((s, f) => s + f.risk, 0))}. Please confirm filing details or any corrections needed and share an update. Thank you.\n\nThis is a reconciliation query, not a determination of ITC eligibility.`;
}
