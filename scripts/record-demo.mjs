import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const dir = "docs/video-source";
mkdirSync(dir, { recursive: true });
const narration = [
  "Your input tax credit needs a follow-up, not another spreadsheet. This is ITC Chase, a working reconciliation preview.",
  "Upload your purchase register and G S T R two B. These sample files contain fifty and forty-six invoices.",
  "Four invoices are missing. Sixteen thousand seven hundred and forty rupees of tax needs review, not automatic rejection.",
  "Each supplier gets a clear list of invoice numbers, dates, and tax amounts. Check the draft, then copy it.",
  "Open WhatsApp or email when you are ready. You choose the recipient and send the message yourself.",
  "Your monthly overview keeps the next step visible. Try the free pilot. The planned subscription is four ninety-nine per month.",
];
for (let i = 0; i < narration.length; i++) {
  const txt = `${dir}/voice-${i}.txt`;
  writeFileSync(txt, narration[i]);
  let r = spawnSync("say", [
    "-v",
    "Samantha",
    "-r",
    "165",
    "-f",
    txt,
    "-o",
    `${dir}/voice-${i}.aiff`,
  ]);
  if (r.status !== 0) throw new Error("Narration failed");
  r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      `${dir}/voice-${i}.aiff`,
      "-af",
      "apad",
      "-t",
      "9",
      "-ar",
      "48000",
      `${dir}/voice-${i}.wav`,
    ],
    { stdio: "ignore" },
  );
  if (r.status !== 0) throw new Error("Audio processing failed");
}
writeFileSync(
  `${dir}/audio-list.txt`,
  narration.map((_, i) => `file 'voice-${i}.wav'`).join("\n"),
);
spawnSync(
  "ffmpeg",
  [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    `${dir}/audio-list.txt`,
    "-c:a",
    "pcm_s16le",
    `${dir}/narration.wav`,
  ],
  { stdio: "ignore" },
);
const captions = [
  ["Your ITC needs a follow-up.", "Not another spreadsheet."],
  [
    "Upload your purchase register and GSTR-2B.",
    "Synthetic sample: 50 purchase invoices, 46 in 2B.",
  ],
  [
    "4 missing invoices. ₹16,740 requiring review.",
    "A reconciliation flag, not an eligibility decision.",
  ],
  [
    "A specific draft for every supplier.",
    "Invoice numbers, dates and tax amounts included.",
  ],
  [
    "Copy it. Open WhatsApp or email.",
    "You review the recipient and send it yourself.",
  ],
  [
    "A clearer month-end. A useful next step.",
    "Free pilot · Planned subscription ₹499/month.",
  ],
];
const time = (s) => `00:00:${String(s).padStart(2, "0")},000`;
writeFileSync(
  `${dir}/captions.srt`,
  captions
    .map(
      (c, i) =>
        `${i + 1}\n${time(i * 9)} --> ${time((i + 1) * 9)}\n${c.join("\n")}\n`,
    )
    .join("\n"),
);
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir, size: { width: 1280, height: 800 } },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
await page.goto("http://localhost:3107");
const start = Date.now();
const until = async (s) => {
  const ms = start + s * 1000 - Date.now();
  if (ms > 0) await page.waitForTimeout(ms);
};
await until(9);
await page.getByRole("link", { name: "Reconcile your invoices" }).click();
await page
  .getByLabel("Purchase register", { exact: true })
  .setInputFiles("public/demo/purchase-register.csv");
await page
  .getByLabel("GSTR-2B", { exact: true })
  .setInputFiles("public/demo/gstr-2b.xlsx");
await until(17);
await page
  .getByRole("button", { name: "Run reconciliation", exact: true })
  .click();
await page.getByTestId("missing-count").waitFor();
await until(27);
await page
  .getByRole("heading", { name: "Ready for your suppliers" })
  .scrollIntoViewIfNeeded();
await page
  .getByRole("button", { name: "Copy follow-up", exact: true })
  .first()
  .scrollIntoViewIfNeeded();
await until(35);
await page
  .getByRole("button", { name: "Copy follow-up", exact: true })
  .first()
  .click();
await until(45);
await page.goto("http://localhost:3107/dashboard");
await until(54);
const video = page.video();
await context.close();
await video.saveAs(`${dir}/walkthrough.webm`);
await browser.close();
console.log("Recorded 54-second walkthrough and six narration segments.");
