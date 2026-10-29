// NutriPlan dev server: no dependencies, live reload, opens your browser.
// Usage: npm start            -> http://localhost:5173
//        npm run start:phone  -> also reachable from your phone on the same Wi-Fi
//        node server.js --root dist --no-reload   (used by `npm run preview`)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, opt("--root", "."));
const HOST = flag("--host") ? "0.0.0.0" : "127.0.0.1";
const LIVE = !flag("--no-reload");
const OPEN = !flag("--no-open") && !process.env.CI;
let port = Number(process.env.PORT || opt("--port", 5173));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mmd": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const RELOAD_SNIPPET = `
<script>
  // Live reload (dev server only)
  (() => {
    const es = new EventSource("/__reload");
    es.onmessage = () => location.reload();
  })();
</script>
`;

const clients = new Set();

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

function resolvePath(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (p.endsWith("/")) p += "index.html";
  const full = path.resolve(ROOT, "." + p);
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return null; // block ../ tricks
  return full;
}

const server = http.createServer((req, res) => {
  if (LIVE && req.url === "/__reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    });
    res.write(": connected\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  let file = resolvePath(req.url);
  if (!file) return send(res, 403, "Forbidden");
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");

  fs.readFile(file, (err, data) => {
    if (err) {
      const isPage = !path.extname(file);
      return send(res, 404, isPage ? `Not found: ${req.url}` : "Not found");
    }
    const ext = path.extname(file).toLowerCase();
    const type = TYPES[ext] || "application/octet-stream";
    if (LIVE && ext === ".html") {
      const html = data.toString("utf8");
      const out = html.includes("</body>")
        ? html.replace("</body>", RELOAD_SNIPPET + "</body>")
        : html + RELOAD_SNIPPET;
      return send(res, 200, out, type);
    }
    send(res, 200, data, type);
  });
});

function watch() {
  let timer = null;
  const ignore = /(^|[\\/])(node_modules|dist|\.git)([\\/]|$)/;
  const notify = (file) => {
    if (file && ignore.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      for (const res of clients) res.write(`data: ${file || "change"}\n\n`);
      if (file) console.log(`  ↻ ${file}`);
    }, 120);
  };
  try {
    fs.watch(ROOT, { recursive: true }, (_e, file) => notify(file));
  } catch {
    // Older Node on Linux: watch the main folders one by one
    for (const dir of [".", "css", "js", "photos", "docs", "docs/uml"]) {
      const d = path.join(ROOT, dir);
      if (fs.existsSync(d)) fs.watch(d, (_e, file) => notify(file && path.join(dir, file)));
    }
  }
}

function lanAddress() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list || []) if (a.family === "IPv4" && !a.internal) return a.address;
  }
  return null;
}

function openBrowser(url) {
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const cmdArgs = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    spawn(cmd, cmdArgs, { stdio: "ignore", detached: true }).on("error", () => {}).unref();
  } catch {
    /* no browser available: the URL is printed above */
  }
}

function listen(attempt = 0) {
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < 10) {
      port += 1;
      listen(attempt + 1);
    } else {
      console.error(err.message);
      process.exit(1);
    }
  });
  server.listen(port, HOST, () => {
    const url = `http://localhost:${port}`;
    console.log("\n  NutriPlan is running\n");
    console.log(`  App:            ${url}/`);
    console.log(`  UML diagrams:   ${url}/docs/`);
    if (HOST === "0.0.0.0") {
      const ip = lanAddress();
      if (ip) console.log(`  On your phone:  http://${ip}:${port}/   (same Wi-Fi)`);
    }
    console.log(LIVE ? "\n  Live reload is on. Save a file and the page refreshes." : "");
    console.log("  Press Ctrl+C to stop.\n");
    if (LIVE) watch();
    if (OPEN) openBrowser(`${url}/`);
  });
}

if (!fs.existsSync(path.join(ROOT, "index.html"))) {
  console.error(`No index.html in ${ROOT}. ${ROOT.endsWith("dist") ? "Run `npm run build` first." : ""}`);
  process.exit(1);
}
listen();
