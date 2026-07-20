/* The documentation tree. Order here drives the sidebar and prev/next links.
   `slug` maps to /docs/<slug> (the MDX file at app/docs/<slug>/page.mdx).
   The empty slug is the /docs index. */

export type DocPage = { slug: string; title: string; short?: string };
export type DocGroup = { group: string; pages: DocPage[] };

export const docsNav: DocGroup[] = [
  {
    group: "Getting started",
    pages: [
      { slug: "", title: "Introduction", short: "Intro" },
      { slug: "why-mnestic", title: "Why mnestic", short: "Why mnestic" },
      { slug: "tutorial", title: "Tutorial" },
      { slug: "install", title: "Installation" },
    ],
  },
  {
    group: "The query language",
    pages: [
      { slug: "queries", title: "Queries" },
      { slug: "stored-relations", title: "Stored relations & transactions", short: "Stored relations" },
      { slug: "types", title: "Types" },
      { slug: "functions", title: "Functions & operators", short: "Functions" },
      { slug: "aggregations", title: "Aggregations" },
      { slug: "query-execution", title: "Query execution" },
      { slug: "tips", title: "Tips for writing queries", short: "Tips" },
    ],
  },
  {
    group: "Search, graphs & time",
    pages: [
      { slug: "proximity-search", title: "Proximity searches", short: "Proximity search" },
      { slug: "algorithms", title: "Utilities & algorithms", short: "Algorithms" },
      { slug: "time-travel", title: "Time travel" },
    ],
  },
  {
    group: "Operations",
    pages: [
      { slug: "system-ops", title: "System ops" },
      { slug: "beyond-cozoscript", title: "Beyond CozoScript" },
    ],
  },
  {
    group: "mnestic — the fork",
    pages: [
      { slug: "fork/overview", title: "What mnestic adds", short: "Overview" },
      { slug: "fork/graph-projections", title: "Cached graph projections", short: "Graph projections" },
      { slug: "fork/hybrid-retrieval", title: "Hybrid retrieval (RRF + MMR)", short: "Hybrid retrieval" },
      { slug: "fork/bitemporality", title: "Bitemporality" },
      { slug: "fork/provenance-semirings", title: "Provenance semirings", short: "Semirings" },
      { slug: "fork/skyline-aggregates", title: "Skyline aggregates", short: "Skylines" },
      { slug: "fork/non-blocking-hnsw", title: "Non-blocking HNSW builds", short: "Non-blocking HNSW" },
      { slug: "fork/equality-pushdown", title: "Equality pushdown" },
      { slug: "fork/join-reorder", title: "Greedy join reorder", short: "Join reorder" },
      { slug: "fork/factorized-counting", title: "Factorized counting", short: "Factorized counting" },
      { slug: "fork/interruptibility", title: "Interruptibility & query budgets", short: "Interruptibility" },
      { slug: "fork/ulid", title: "ULID identifiers", short: "ULIDs" },
      { slug: "fork/migrating", title: "Migrating from CozoDB", short: "Migrating" },
    ],
  },
  {
    group: "Reference",
    pages: [
      { slug: "release-notes", title: "Release history", short: "Releases" },
      { slug: "license", title: "License & attribution", short: "License" },
    ],
  },
];

/* Flattened, ordered list for prev/next navigation. */
export const flatDocs: DocPage[] = docsNav.flatMap((g) => g.pages);

export function docHref(slug: string): string {
  return slug ? `/docs/${slug}` : "/docs";
}

export function adjacentDocs(slug: string): {
  prev: DocPage | null;
  next: DocPage | null;
} {
  const i = flatDocs.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? flatDocs[i - 1] : null,
    next: i >= 0 && i < flatDocs.length - 1 ? flatDocs[i + 1] : null,
  };
}

export function docTitle(slug: string): string | undefined {
  return flatDocs.find((p) => p.slug === slug)?.title;
}
