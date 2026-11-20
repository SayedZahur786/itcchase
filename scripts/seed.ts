import { demoInvoices } from "../lib/demo";
import * as XLSX from "xlsx";
import { writeFileSync } from "node:fs";
const rows = demoInvoices().map((i) => ({
  GSTIN: i.gstin,
  Supplier: i.supplier,
  "Invoice Number": i.number,
  "Invoice Date": i.date,
  "Taxable Value": i.taxable / 100,
  IGST: i.igst / 100,
  CGST: i.cgst / 100,
  SGST: i.sgst / 100,
  Cess: i.cess / 100,
}));
writeFileSync(
  "public/demo/purchase-register.csv",
  XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(rows)),
);
const b = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(
  b,
  XLSX.utils.json_to_sheet(rows.filter((_, i) => ![6, 17, 28, 39].includes(i))),
  "Invoices",
);
XLSX.writeFile(b, "public/demo/gstr-2b.xlsx");
