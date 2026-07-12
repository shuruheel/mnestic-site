/* Ranking for the docs search.

   Kept apart from the dialog that renders it: this is the half with the
   judgement in it, and it should be testable without a DOM. The index it
   consumes is built by scripts/build-search-index.mjs. */

export type Page = { s: string; t: string; d: string };
export type Section = { p: number; h?: string; a?: string; c: string };
export type SearchIndex = { v: number; pages: Page[]; sections: Section[] };

/** A section with its page attached and its text pre-lowered for matching. */
export type Entry = {
  page: Page;
  heading?: string;
  anchor?: string;
  text: string;
  lcTitle: string;
  lcHeading: string;
  lcText: string;
  lcDesc: string;
};

export type Hit = { entry: Entry; score: number };
export type Group = { page: Page; hits: Hit[]; score: number };

export const MAX_PAGES = 6;
export const MAX_HITS_PER_PAGE = 4;

export function prepare(ix: SearchIndex): Entry[] {
  return ix.sections.map((s) => {
    const page = ix.pages[s.p];
    return {
      page,
      heading: s.h,
      anchor: s.a,
      text: s.c,
      lcTitle: page.t.toLowerCase(),
      lcHeading: (s.h ?? "").toLowerCase(),
      lcText: s.c.toLowerCase(),
      lcDesc: (page.d ?? "").toLowerCase(),
    };
  });
}

export const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Matching is by substring, which gets singular→plural for free ("type" finds
   "types") but nothing in the other direction: "aggregate" and "aggregations"
   share only the stem "aggregat". So query words are cut back to a stem before
   they are matched. Identifiers are left alone — `min_cost_k` and `::explain`
   are not English and must match exactly. */
const SUFFIXES = [
  "ations", "ation", "ions", "ion", "ings", "ing", "ives", "ive",
  "ies", "ed", "es", "s", "ly", "ate", "ment", "ness", "able",
];

export function stem(term: string): string {
  if (!/^[a-z]{6,}$/.test(term)) return term;
  for (const suffix of SUFFIXES) {
    if (term.endsWith(suffix)) {
      const root = term.slice(0, -suffix.length);
      if (root.length >= 4) return root;
    }
  }
  return term;
}

/** Query → the stems actually matched against the index. */
export function termsOf(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(stem);
}

function occurrences(haystack: string, needle: string): number {
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) {
    n += 1;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return n;
}

/** True when the term starts on a word boundary: `sort` in ":sort" scores like
    a word, `sort` inside "assorted" does not. */
function onBoundary(haystack: string, needle: string): boolean {
  return new RegExp(`(^|[^a-z0-9_])${escapeRe(needle)}`).test(haystack);
}

/* Body frequency is normalized by section length, BM25-style. Counting raw
   occurrences lets a long section that says "::explain" in passing four times
   outrank the short section that *is* the ::explain reference. */
const K1 = 1.2;
const B = 0.6;

function bodyScore(tf: number, length: number, avgLength: number): number {
  const norm = 1 - B + B * (length / avgLength);
  return (tf * (K1 + 1)) / (tf + K1 * norm);
}

export function scoreEntry(
  e: Entry,
  terms: string[],
  phrase: string,
  avgLength: number,
  tfs: number[],
): number {
  let score = 0;

  for (const [i, term] of terms.entries()) {
    let t = 0;
    if (e.lcTitle.includes(term)) t += onBoundary(e.lcTitle, term) ? 14 : 7;
    if (e.lcHeading.includes(term)) t += onBoundary(e.lcHeading, term) ? 10 : 5;

    const tf = tfs[i];
    if (tf > 0) {
      const weight = onBoundary(e.lcText, term) ? 3 : 1;
      t += weight * bodyScore(tf, e.lcText.length, avgLength);
    }

    // Every term must land somewhere, or the result is noise.
    if (t === 0) return 0;

    // The page's own summary separates the page that owns a topic from one that
    // merely cites it. Strictly a tiebreaker, applied only once the section has
    // matched on its own merits — a page summary must never conjure a hit in a
    // section whose text does not contain the term at all.
    if (e.lcDesc.includes(term)) t += onBoundary(e.lcDesc, term) ? 3 : 1.5;

    score += t;
  }

  // Reward the whole query surviving intact: "graph projection" should beat a
  // section that merely says "graph" in one place and "projection" in another.
  if (phrase.length > 2 && terms.length > 1) {
    if (e.lcHeading.includes(phrase)) score += 12;
    if (e.lcTitle.includes(phrase)) score += 10;
    if (e.lcText.includes(phrase)) score += 6;
  }
  if (e.lcTitle === phrase) score += 25;
  if (e.lcHeading === phrase) score += 20;

  return score;
}

/* How much a page's overall command of a term lifts its sections. A section is
   ranked partly on the company it keeps: `::explain` appears 17 times across 8
   sections of "Query execution", and 3 times across 2 sections of a fork page
   that merely mentions it. Without this, whichever single section repeats the
   word most wins, and the reader lands on a footnote instead of the reference.
   Normalized against the strongest page for that term, so it measures ownership
   rather than page length. */
const PAGE_WEIGHT = 5;

function pageBonuses(
  entries: Entry[],
  terms: string[],
  tfs: number[][],
): Map<string, number> {
  const perPage = new Map<string, number[]>();

  for (const [i, entry] of entries.entries()) {
    const totals =
      perPage.get(entry.page.s) ?? terms.map(() => 0);
    for (let t = 0; t < terms.length; t += 1) totals[t] += tfs[i][t];
    perPage.set(entry.page.s, totals);
  }

  const strongest = terms.map((_, t) =>
    Math.max(0, ...[...perPage.values()].map((totals) => totals[t])),
  );

  const bonuses = new Map<string, number>();
  for (const [slug, totals] of perPage) {
    let bonus = 0;
    for (let t = 0; t < terms.length; t += 1) {
      if (totals[t] > 0 && strongest[t] > 0) {
        bonus +=
          PAGE_WEIGHT * (Math.log1p(totals[t]) / Math.log1p(strongest[t]));
      }
    }
    bonuses.set(slug, bonus);
  }
  return bonuses;
}

/** Rank sections, then group them under the page they came from. */
export function search(entries: Entry[], query: string): Group[] {
  const phrase = query.trim().toLowerCase();
  const terms = termsOf(phrase);
  if (terms.length === 0) return [];

  const avgLength =
    entries.reduce((n, e) => n + e.lcText.length, 0) / (entries.length || 1);

  // Counted once, then reused for both the page signal and each section's score.
  const tfs = entries.map((e) => terms.map((t) => occurrences(e.lcText, t)));
  const bonuses = pageBonuses(entries, terms, tfs);

  const byPage = new Map<string, Group>();

  for (const [i, entry] of entries.entries()) {
    const own = scoreEntry(entry, terms, phrase, avgLength, tfs[i]);
    if (own === 0) continue;
    const score = own + (bonuses.get(entry.page.s) ?? 0);

    const key = entry.page.s;
    const group = byPage.get(key) ?? { page: entry.page, hits: [], score: 0 };
    group.hits.push({ entry, score });
    group.score = Math.max(group.score, score);
    byPage.set(key, group);
  }

  return [...byPage.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PAGES)
    .map((g) => ({
      ...g,
      hits: g.hits.sort((a, b) => b.score - a.score).slice(0, MAX_HITS_PER_PAGE),
    }));
}

/** A window of the section's text around the first term that matched. */
export function snippet(entry: Entry, terms: string[], length = 150): string {
  let at = -1;
  for (const term of terms) {
    const i = entry.lcText.indexOf(term);
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  if (at === -1) at = 0;

  let start = Math.max(0, at - 48);
  if (start > 0) {
    const space = entry.text.indexOf(" ", start);
    if (space !== -1 && space < start + 24) start = space + 1;
  }
  const end = Math.min(entry.text.length, start + length);

  return (
    (start > 0 ? "…" : "") +
    entry.text.slice(start, end).trim() +
    (end < entry.text.length ? "…" : "")
  );
}
