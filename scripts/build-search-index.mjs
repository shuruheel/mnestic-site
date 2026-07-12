#!/usr/bin/env node
/**
 * Builds public/search-index.json from the docs MDX sources.
 *
 * The docs are static MDX with no CMS behind them, so the search index is a
 * build artifact: this script is the first half of `pnpm build`, and the client
 * (components/docs/search.tsx) fetches the JSON lazily the first time a reader
 * opens the search dialog.
 *
 * A page is split into sections at its h2/h3 headings, so a hit lands on the
 * heading that answers the query rather than at the top of a 30KB page. Anchors
 * are produced with github-slugger, the same slugger rehype-slug uses, fed every
 * heading in document order — `functions` has two `concat(x, ...)` headings and
 * the second one's id really is `concatx--1`.
 *
 * Code inside fences is indexed as text, not stripped: `min_cost_k`, `:as_of`
 * and `::hnsw` are what a developer actually types into an engine's docs search.
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_DIR = join(root, "src/app/docs");
const OUT_FILE = join(root, "public/search-index.json");

/* ── MDX → plain text ─────────────────────────────────────────────────────── */

/** Strip markdown/JSX syntax from prose. Never call this on code. */
function stripProse(text) {
  return (
    text
      // JSX components used in the MDX (<Callout …>, </Callout>, <Attribution />).
      // Safe here only because code spans are handled by the caller: an
      // unguarded run would also eat `Vec<String>` out of inline code.
      .replace(/<\/?[A-Z][A-Za-z0-9]*(?:\s[^>]*?)?\/?>/gs, " ")
      // Images and links keep their visible text.
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      // Underscore emphasis only at word boundaries — an unanchored rule would
      // chew the middle out of identifiers like min_cost_k.
      .replace(/(^|[\s([{"'])__([^_]+?)__(?=[\s.,;:)\]}!?"']|$)/gm, "$1$2")
      .replace(/(^|[\s([{"'])_([^_]+?)_(?=[\s.,;:)\]}!?"']|$)/gm, "$1$2")
      // Backslash escapes.
      .replace(/\\([\\`*_{}[\]()#+\-.!])/g, "$1")
      // Table pipes and leading blockquote/list markers.
      .replace(/^\s{0,3}>\s?/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/\|/g, " ")
      // GFM table rules (|---|---|).
      .replace(/^\s*:?-{3,}:?(\s+:?-{3,}:?)*\s*$/gm, " ")
  );
}

/**
 * Inline markdown → the text content the browser ends up rendering. This is
 * also what rehype-slug sees when it builds a heading's id.
 *
 * Code spans are masked to placeholders first, so their contents survive
 * verbatim (`Vec<String>` must not read as a JSX tag) while link and emphasis
 * rules still see the whole construct they span — the docs are full of links
 * whose text is inline code, like [`::kill` and `:timeout`](…).
 */
function inlineToText(md) {
  const codes = [];
  const masked = md.replace(/(`+)([\s\S]*?)\1/g, (_, __, code) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });
  return stripProse(masked)
    .replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)])
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split an MDX source into ordered blocks, tracking fenced code. Consecutive
 * prose lines merge into one block: the sources are hard-wrapped, so emphasis
 * and links routinely straddle a line break and a per-line strip would leave
 * `**bag semantics**` sitting in the index with its asterisks on.
 */
function blocksOf(source) {
  const blocks = [];
  let inFence = false;
  let run = null; // an open prose or code block, still collecting lines

  const close = () => {
    if (run) blocks.push({ ...run, text: run.lines.join("\n") });
    run = null;
  };
  const collect = (kind, line) => {
    if (run?.kind !== kind) {
      close();
      run = { kind, lines: [] };
    }
    run.lines.push(line);
  };

  for (const line of source.split(/\r?\n/)) {
    if (/^\s*(?:```+|~~~+)/.test(line)) {
      close();
      inFence = !inFence;
      continue; // the fence line itself only carries the language
    }
    if (inFence) {
      // Code is indexed verbatim. Comment lines inside CozoScript blocks start
      // with '#', which is exactly why headings may only be read outside fences.
      collect("code", line);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      close();
      blocks.push({
        kind: "heading",
        depth: heading[1].length,
        text: heading[2].trim(),
      });
      continue;
    }
    collect("prose", line);
  }
  close();
  return blocks;
}

/** Pull `export const metadata = {…}` off the top and read title/description. */
function takeMetadata(source) {
  const block = source.match(/^export const metadata\s*=\s*\{[\s\S]*?^\};?$/m);
  if (!block) return { source, description: "" };
  const description = block[0]
    .match(/description:\s*(?:\n\s*)?"((?:[^"\\]|\\.)*)"/)?.[1]
    ?.replace(/\\"/g, '"')
    .replace(/\\n/g, " ");
  return {
    source: source.slice(0, block.index) + source.slice(block.index + block[0].length),
    description: description ?? "",
  };
}

/** One MDX file → { title, description, sections[] }. */
function parsePage(raw) {
  const { source, description } = takeMetadata(raw);
  const slugger = new GithubSlugger();

  let title = "";
  const sections = [];
  let current = { heading: null, anchor: null, chunks: [] };

  const flush = () => {
    const text = current.chunks.join(" ").replace(/\s+/g, " ").trim();
    if (text || current.heading) sections.push({ ...current, text });
  };

  for (const block of blocksOf(source)) {
    if (block.kind === "code") {
      current.chunks.push(block.text);
      continue;
    }
    if (block.kind === "prose") {
      const text = inlineToText(block.text);
      if (text) current.chunks.push(text);
      continue;
    }

    // Heading. Every heading level advances the slugger, because rehype-slug
    // slugs h1–h6 in document order and its dedupe counter is shared.
    const text = inlineToText(block.text);
    const anchor = slugger.slug(text);

    if (block.depth === 1) {
      title = text;
      continue; // the h1 opens the intro section rather than closing one
    }
    if (block.depth === 2 || block.depth === 3) {
      flush();
      current = { heading: text, anchor, chunks: [] };
      continue;
    }
    // h4+ folds into the section above it, but stays searchable.
    current.chunks.push(text);
  }
  flush();

  // The metadata description is a hand-written summary of the page: worth
  // matching on, and it is what the reader sees under the title in a hit.
  if (description && sections.length > 0 && sections[0].heading === null) {
    sections[0].text = `${description} ${sections[0].text}`.trim();
  } else if (description) {
    sections.unshift({ heading: null, anchor: null, text: description });
  }

  return { title, description, sections };
}

/* ── Walk the docs tree ───────────────────────────────────────────────────── */

async function findPages(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await findPages(path)));
    else if (entry.name === "page.mdx") found.push(path);
  }
  return found;
}

const files = (await findPages(DOCS_DIR)).sort();
const pages = [];
const sections = [];

for (const file of files) {
  const slug = relative(DOCS_DIR, dirname(file)).split("\\").join("/"); // "" = /docs
  const parsed = parsePage(await readFile(file, "utf8"));

  if (!parsed.title) {
    console.warn(`search-index: ${relative(root, file)} has no h1 — skipped`);
    continue;
  }

  const page = pages.push({ s: slug, t: parsed.title, d: parsed.description }) - 1;
  for (const section of parsed.sections) {
    // A heading with no prose under it — "## Centrality measures", which exists
    // only to introduce its subsections — is still worth finding, so it earns a
    // row on the strength of its heading alone.
    if (!section.text && !section.heading) continue;
    sections.push({
      p: page,
      h: section.heading ?? undefined,
      a: section.anchor ?? undefined,
      c: section.text,
    });
  }
}

const index = { v: 1, pages, sections };
const json = JSON.stringify(index);

await mkdir(dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, json);

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
console.log(
  `search-index: ${pages.length} pages, ${sections.length} sections, ${kb(json.length)} → ${relative(root, OUT_FILE)}`,
);
