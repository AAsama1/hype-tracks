/**
 * CI check: every Handlebars template must render exactly one top-level HTML element,
 * because ApplicationV2 template parts reject anything else.
 * Usage: node .github/scripts/check-templates.mjs templates/*.hbs
 */
import { readFileSync } from "node:fs";

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
let failed = false;

for (const file of process.argv.slice(2)) {
  const html = readFileSync(file, "utf8")
    .replace(/\{\{!--[\s\S]*?--\}\}|\{\{![\s\S]*?\}\}/g, "") // Handlebars comments
    .replace(/<!--[\s\S]*?-->/g, "")                        // HTML comments
    .replace(/\{\{[\s\S]*?\}\}/g, "");                       // all other mustaches

  let depth = 0;
  let roots = 0;
  let strayText = false;
  let last = 0;
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)[^>]*?(\/?)>/g)) {
    if (depth === 0 && html.slice(last, m.index).trim()) strayText = true;
    last = m.index + m[0].length;
    const [, closing, tag, selfClosing] = m;
    if (closing) depth--;
    else {
      if (depth === 0) roots++;
      if (!selfClosing && !VOID.has(tag.toLowerCase())) depth++;
    }
  }
  if (html.slice(last).trim()) strayText = true;

  if (roots !== 1 || strayText || depth !== 0) {
    failed = true;
    console.error(`${file}: expected 1 root element, found ${roots}${strayText ? " plus text outside it" : ""}${depth ? `, unbalanced tags (${depth})` : ""}`);
  } else {
    console.log(`${file}: ok`);
  }
}

process.exit(failed ? 1 : 0);
