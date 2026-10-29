// Copies the app into dist/ so it can be hosted anywhere (Netlify Drop, GitHub Pages, any web host).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const include = ["index.html", "favicon.svg", "css", "js", "photos", "docs", "CREDITS.md"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

let files = 0;
let bytes = 0;
function copy(from, to) {
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const name of fs.readdirSync(from)) copy(path.join(from, name), path.join(to, name));
  } else {
    fs.copyFileSync(from, to);
    files += 1;
    bytes += stat.size;
  }
}

for (const item of include) {
  const from = path.join(root, item);
  if (fs.existsSync(from)) copy(from, path.join(dist, item));
}

console.log(`\n  Built dist/ — ${files} files, ${(bytes / 1e6).toFixed(1)} MB`);
console.log("  Preview it:   npm run preview");
console.log("  Host it:      drag the dist folder onto https://app.netlify.com/drop\n");
