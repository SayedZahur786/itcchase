import sharp from "sharp";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const dir = "docs/video-source";
const blocks = readFileSync(`${dir}/captions.srt`, "utf8").trim().split("\n\n");
for (let i = 0; i < blocks.length; i++) {
  const lines = blocks[i].split("\n").slice(2);
  const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
  await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="140"><rect width="1280" height="140" fill="#172f2a"/><text x="640" y="55" text-anchor="middle" fill="white" font-family="Arial" font-size="32" font-weight="bold">${esc(lines[0])}</text><text x="640" y="102" text-anchor="middle" fill="#d9e8dd" font-family="Arial" font-size="27">${esc(lines[1])}</text></svg>`,
    ),
  )
    .png()
    .toFile(`${dir}/caption-${i}.png`);
}
const args = [
  "-y",
  "-i",
  `${dir}/walkthrough.webm`,
  "-i",
  `${dir}/narration.wav`,
];
for (let i = 0; i < 6; i++)
  args.push("-loop", "1", "-i", `${dir}/caption-${i}.png`);
let filter = "[0:v]pad=1280:940:0:0:color=0x172f2a[v0];";
for (let i = 0; i < 6; i++)
  filter += `[v${i}][${i + 2}:v]overlay=0:800:enable='between(t,${i * 9},${(i + 1) * 9})'[v${i + 1}]${i === 5 ? "" : ";"}`;
args.push(
  "-filter_complex",
  filter,
  "-map",
  "[v6]",
  "-map",
  "1:a",
  "-t",
  "54",
  "-c:v",
  "libx264",
  "-preset",
  "fast",
  "-crf",
  "23",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-movflags",
  "+faststart",
  "docs/demo.mp4",
);
const result = spawnSync("ffmpeg", args, { stdio: "inherit" });
if (result.status !== 0) process.exit(1);
spawnSync(
  "ffmpeg",
  [
    "-y",
    "-ss",
    "20",
    "-i",
    "docs/demo.mp4",
    "-frames:v",
    "1",
    "docs/demo-poster.png",
  ],
  { stdio: "ignore" },
);
console.log("Rendered narrated walkthrough with burned-in captions.");
