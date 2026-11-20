import * as XLSX from "xlsx";
import { unzipSync } from "fflate";
import type { Invoice } from "./match";
const fields = {
  gstin: ["gstin", "gstin of supplier", "supplier gstin"],
  supplier: [
    "supplier",
    "trade legal name",
    "trade/legal name",
    "supplier name",
    "legal name",
  ],
  number: ["invoice number", "invoice no", "invoice no.", "inum"],
  date: ["invoice date", "date", "idt"],
  taxable: ["taxable value", "taxable", "txval"],
  igst: ["igst", "integrated tax", "integrated tax(₹)", "integrated tax (₹)"],
  cgst: ["cgst", "central tax", "central tax(₹)", "central tax (₹)"],
  sgst: ["sgst", "state/ut tax", "state/ut tax(₹)", "state/ut tax (₹)"],
  cess: ["cess", "cess(₹)", "cess (₹)"],
} as const;
function dateValue(value: unknown): string {
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value);
    if (!d) throw new Error("Invalid Excel date.");
    return dateValue(
      `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`,
    );
  }
  const s = String(value ?? "").trim();
  let iso = s;
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) iso = `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(iso) ||
    !Number.isFinite(Date.parse(iso)) ||
    new Date(iso).toISOString().slice(0, 10) !== iso
  )
    throw new Error(
      "Use valid invoice dates in YYYY-MM-DD or DD/MM/YYYY format.",
    );
  return iso;
}
function amount(v: unknown): number {
  const s = String(v ?? "").replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s))
    throw new Error(
      "Amounts must be non-negative numbers with at most two decimal places. Credit notes are not supported.",
    );
  const p = Math.round(Number(s) * 100);
  if (!Number.isSafeInteger(p) || p > 1e10)
    throw new Error("Amount exceeds the supported limit.");
  return p;
}
export function parseInvoices(bytes: Uint8Array, filename: string): Invoice[] {
  if (!bytes.length || bytes.length > 2 * 1024 * 1024)
    throw new Error("Each file must be nonempty and no larger than 2 MB.");
  if (!/\.(csv|xlsx)$/i.test(filename))
    throw new Error(
      "Upload a CSV or XLSX file. Macro-enabled and legacy XLS files are not supported.",
    );
  if (/\.xlsx$/i.test(filename)) {
    let total = 0;
    unzipSync(bytes, {
      filter: (entry) => {
        total += entry.originalSize;
        if (total > 16 * 1024 * 1024 || entry.originalSize > 8 * 1024 * 1024)
          throw new Error("Workbook expands beyond the 16 MB safety limit.");
        if (/vbaProject|externalLinks/i.test(entry.name))
          throw new Error("External links and macros are not supported.");
        return false;
      },
    });
  }
  const workbook = XLSX.read(bytes, {
    type: "array",
    cellFormula: true,
    raw: true,
    sheetRows: 5025,
  });
  const candidates: Invoice[][] = [];
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
    });
    const normalized = (v: unknown) =>
      String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    let header = -1;
    let indexes: Record<string, number> = {};
    for (let r = 0; r < Math.min(20, rows.length); r++) {
      const cells = rows[r].map(normalized);
      const found = Object.fromEntries(
        Object.entries(fields).map(([k, aliases]) => [
          k,
          cells.findIndex((c) => (aliases as readonly string[]).includes(c)),
        ]),
      );
      if (["gstin", "number", "date", "taxable"].every((k) => found[k] >= 0)) {
        header = r;
        indexes = found;
        break;
      }
    }
    if (header < 0) continue;
    if (["igst", "cgst", "sgst"].some((k) => indexes[k] < 0))
      throw new Error(
        "Include separate IGST, CGST and SGST columns; use zero where not applicable. Download the supported template.",
      );
    const actual = rows
      .slice(header + 1)
      .filter((r) => r.some((v) => String(v).trim()));
    if (actual.length > 5000)
      throw new Error("Maximum 5,000 invoices per file.");
    for (const [addr, cell] of Object.entries(sheet))
      if (
        !addr.startsWith("!") &&
        typeof cell === "object" &&
        cell &&
        "f" in cell
      )
        throw new Error(
          "Formula cells are not supported. Export calculated values before uploading.",
        );
    candidates.push(
      actual.map((row, n) => {
        try {
          const get = (k: string) => (indexes[k] >= 0 ? row[indexes[k]] : "");
          const gstin = String(get("gstin")).trim().toUpperCase();
          const number = String(get("number")).trim();
          if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(gstin))
            throw new Error("Invalid supplier GSTIN format.");
          if (!number || number.length > 64 || /^[=+@-]/.test(number))
            throw new Error("Invoice number is missing or unsupported.");
          const supplier = String(get("supplier") || gstin).trim();
          if (supplier.length > 160)
            throw new Error("Supplier name is too long.");
          return {
            gstin,
            supplier,
            number,
            date: dateValue(get("date")),
            taxable: amount(get("taxable")),
            igst: amount(get("igst")),
            cgst: amount(get("cgst")),
            sgst: amount(get("sgst")),
            cess: indexes.cess >= 0 ? amount(get("cess")) : 0,
          };
        } catch (e) {
          throw new Error(
            `Row ${header + n + 2}: ${e instanceof Error ? e.message : "Invalid invoice."}`,
          );
        }
      }),
    );
  }
  if (candidates.length !== 1)
    throw new Error(
      candidates.length
        ? "Multiple invoice sheets detected. Upload one normalized invoice sheet per file."
        : "No supported invoice table found. Use the downloadable column template; official multi-row 2B exports may need normalization.",
    );
  if (!candidates[0].length) throw new Error("No invoice rows found.");
  return candidates[0];
}
