// Re-renders every docs/uml/*.mmd diagram to SVG with the Mermaid CLI.
// Run after editing a diagram:  npm run uml
// The first run downloads the Mermaid CLI (and a headless browser) through npx, so it takes a minute.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "docs", "uml");
const sources = fs.readdirSync(dir).filter((f) => f.endsWith(".mmd")).sort();
const config = path.join(root, "docs", "mermaid.config.json");
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

let failed = 0;
for (const file of sources) {
  const input = path.join(dir, file);
  const output = input.replace(/\.mmd$/, ".svg");
  process.stdout.write(`  ${file} → ${path.basename(output)} ... `);
  const r = spawnSync(
    npx,
    ["-y", "@mermaid-js/mermaid-cli@11", "-i", input, "-o", output, "-c", config, "-b", "transparent"],
    { stdio: ["ignore", "ignore", "pipe"], shell: process.platform === "win32" }
  );
  if (r.status === 0) console.log("ok");
  else {
    failed += 1;
    console.log("failed");
    console.error(String(r.stderr || "").trim());
  }
}
console.log(failed ? `\n  ${failed} diagram(s) failed.` : `\n  Rendered ${sources.length} diagrams into docs/uml/.`);
process.exit(failed ? 1 : 0);
