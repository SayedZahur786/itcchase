import { type Invoice, reconcile } from "./match";
export function demoInvoices(): Invoice[] {
  const suppliers = [
    "Kaveri Packaging",
    "Deccan Office Supplies",
    "Malabar Industrial Goods",
    "Konkan Distribution",
    "Narmada Paper Works",
  ];
  return Array.from({ length: 50 }, (_, n) => ({
    gstin: `27ABCDE${String(1000 + (n % 5))}F1Z5`,
    supplier: suppliers[n % 5],
    number: `INV-${String(2101 + n)}`,
    date: `2026-10-${String(1 + (n % 28)).padStart(2, "0")}`,
    taxable: (12000 + n * 500) * 100,
    igst: 0,
    cgst: (1080 + n * 45) * 100,
    sgst: (1080 + n * 45) * 100,
    cess: 0,
  }));
}
export function demoReport() {
  const purchases = demoInvoices();
  return {
    ...reconcile(
      purchases,
      purchases.filter((_, i) => ![6, 17, 28, 39].includes(i)),
      true,
    ),
    id: "demo",
  };
}
