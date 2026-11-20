import { test } from "node:test";
import assert from "node:assert/strict";
import { demoInvoices, demoReport } from "../lib/demo";
import { reconcile, supplierMessage, tax } from "../lib/match";
import { parseInvoices } from "../lib/parse";
import * as XLSX from "xlsx";
const i = demoInvoices()[0];
test("50-row fixture has exactly four missing and exact integer risk total", () => {
  const r = demoReport();
  assert.equal(r.purchaseCount, 50);
  assert.equal(r.findings.filter((f) => f.status === "missing").length, 4);
  assert.equal(
    r.totalRisk,
    [6, 17, 28, 39].reduce((s, n) => s + tax(demoInvoices()[n]), 0),
  );
  assert.equal(r.months[0].risk, r.totalRisk);
});
test("one-to-one matching normalizes case, retains invoice punctuation", () => {
  assert.equal(reconcile([i], [{ ...i, number: " inv-2101 " }]).totalRisk, 0);
  assert.equal(
    reconcile([i], [{ ...i, number: "INV2101" }]).findings[0].status,
    "missing",
  );
});
test("date and tax component boundaries are explicit", () => {
  assert.equal(
    reconcile([i], [{ ...i, date: "2026-10-03", cgst: i.cgst + 100 }])
      .totalRisk,
    0,
  );
  assert.equal(
    reconcile([i], [{ ...i, date: "2026-10-04" }]).findings[0].status,
    "mismatched",
  );
  assert.equal(
    reconcile([i], [{ ...i, cgst: i.cgst + 101, sgst: i.sgst - 101 }])
      .findings[0].status,
    "mismatched",
  );
});
test("duplicate keys fail closed on either side", () => {
  assert.throws(() => reconcile([i, i], [i]), /Duplicate/);
  assert.throws(() => reconcile([i], [i, i]), /Duplicate/);
});
test("month risk and statement-only invoices are accounted for", () => {
  const j = { ...i, number: "NOV-1", date: "2026-11-01" };
  const r = reconcile([i, j], [{ ...i, number: "EXTRA" }]);
  assert.equal(r.months.length, 2);
  assert.equal(r.extra.length, 1);
  assert.equal(r.totalRisk, tax(i) * 2);
});
test("follow-up carries invoice identity and review language", () => {
  const s = supplierMessage(
    demoReport().findings.filter((f) => f.status === "missing"),
  );
  assert.match(s, /INV-2107/);
  assert.match(s, /not a determination/);
});
const csv = (date = "2026-10-01", value = "100") =>
  new TextEncoder().encode(
    `GSTIN,Supplier,Invoice Number,Invoice Date,Taxable Value,IGST,CGST,SGST,Cess\n${i.gstin},Trader,A1,${date},${value},0,9,9,0`,
  );
test("CSV parsing and invalid date, negative amount, unsupported file denial", () => {
  assert.equal(parseInvoices(csv(), "book.csv")[0].taxable, 10000);
  assert.throws(() => parseInvoices(csv("2026-02-30"), "book.csv"), /dates/);
  assert.throws(
    () => parseInvoices(csv("2026-10-01", "-1"), "book.csv"),
    /non-negative/,
  );
  assert.throws(() => parseInvoices(csv(), "book.xlsm"), /Macro/);
});
test("rejects formulas and missing tax columns", () => {
  const s = XLSX.utils.aoa_to_sheet([
    [
      "GSTIN",
      "Invoice Number",
      "Invoice Date",
      "Taxable Value",
      "IGST",
      "CGST",
      "SGST",
    ],
    [i.gstin, "A1", "2026-10-01", 100, 0, 9, 9],
  ]);
  s.D2.f = "10*10";
  const b = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(b, s, "Invoices");
  assert.throws(
    () =>
      parseInvoices(
        XLSX.write(b, { type: "buffer", bookType: "xlsx" }),
        "book.xlsx",
      ),
    /Formula/,
  );
  assert.throws(
    () =>
      parseInvoices(
        new TextEncoder().encode(
          "GSTIN,Invoice Number,Invoice Date,Taxable Value\nA,B,C,D",
        ),
        "book.csv",
      ),
    /separate/,
  );
});
