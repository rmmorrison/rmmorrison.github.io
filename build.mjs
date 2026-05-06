// build.mjs — compile the JSX source into a static /dist that GitHub Pages
// can serve. No bundler, no minifier; just Babel for JSX → JS, plus a tiny
// HTML rewrite that swaps the in-browser Babel script tags for the compiled
// output.
//
// Usage:
//   node build.mjs        # writes ./dist
//
// The CI workflow runs this and uploads /dist as the Pages artifact.

import { readFile, writeFile, mkdir, rm, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import babel from "@babel/core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "src");
const OUT = join(__dirname, "dist");

async function main() {
  // Clean out the previous build.
  if (existsSync(OUT)) await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  // 1. Compile app.jsx → app.js and classic.jsx → classic.js.
  //    tweaks-panel.jsx is dev-only; we don't ship it.
  const jsxFiles = ["app.jsx", "classic.jsx"];
  for (const file of jsxFiles) {
    const jsx = await readFile(join(SRC, file), "utf8");
    const compiled = await babel.transformAsync(jsx, {
      presets: [["@babel/preset-react", { runtime: "classic" }]],
      babelrc: false,
      configFile: false,
      sourceType: "script",
      filename: file,
    });
    const banner = `// Compiled from src/${file} — do not edit by hand.\n`;
    const outName = file.replace(/\.jsx$/, ".js");
    await writeFile(join(OUT, outName), banner + compiled.code, "utf8");
  }

  // 2. Copy the static assets that don't need a build step.
  await copyFile(join(SRC, "shader.js"), join(OUT, "shader.js"));
  await copyFile(join(SRC, "styles.css"), join(OUT, "styles.css"));
  await copyFile(join(SRC, "classic.css"), join(OUT, "classic.css"));

  // 3. Rewrite index.html: replace the dev script block with the prod one.
  const html = await readFile(join(SRC, "index.html"), "utf8");
  const prodScripts = [
    '  <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>',
    '  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>',
    '  <script src="shader.js"></script>',
    '  <script src="classic.js"></script>',
    '  <script src="app.js"></script>',
  ].join("\n");

  const rewritten = html.replace(
    /\s*<!-- build:scripts -->[\s\S]*?<!-- endbuild -->\s*/m,
    "\n" + prodScripts + "\n",
  );
  if (rewritten === html) {
    throw new Error("build:scripts marker not found in src/index.html");
  }
  await writeFile(join(OUT, "index.html"), rewritten, "utf8");

  // 4. Static extras (custom domain, robots, 404 fallback).
  const extras = ["CNAME", "robots.txt", "404.html"];
  for (const file of extras) {
    const path = join(SRC, file);
    if (existsSync(path)) {
      await copyFile(path, join(OUT, file));
    }
  }

  console.log("✓ build complete → dist/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
