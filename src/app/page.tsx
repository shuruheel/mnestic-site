import type { ReactNode } from "react";
import { Logo, Mark } from "./logo";

/* ──────────────────────────────────────────────────────────────
   Links
   ────────────────────────────────────────────────────────────── */
const GITHUB = "https://github.com/shuruheel/mnestic";
const DOCS = "/docs";
const CRATE = "https://crates.io/crates/mnestic";
const UPSTREAM = "https://github.com/cozodb/cozo";

/* ──────────────────────────────────────────────────────────────
   Tiny syntax highlighter for the code blocks (no client JS).
   Tokenizes a small CozoScript / Rust subset into colored spans.
   ────────────────────────────────────────────────────────────── */
type Tok = { t: string; c?: string };

function hl(line: string, lang: "cozo" | "rust"): ReactNode[] {
  const out: ReactNode[] = [];
  // comments first
  const commentIdx = line.search(lang === "rust" ? /\/\// : /(^|\s)#/);
  let head = line;
  let comment = "";
  if (commentIdx >= 0) {
    const at = lang === "rust" ? commentIdx : line.indexOf("#", commentIdx);
    head = line.slice(0, at);
    comment = line.slice(at);
  }

  const keywords =
    lang === "rust"
      ? /\b(let|use|fn|mut|pub|struct|impl|Some|None|Default|Vec|Ok|self|return|match|true|false)\b/g
      : /\b(query|ef|k|bind_distance)\b/g;

  const tokens: Tok[] = [];
  let rest = head;
  const pat =
    /("[^"]*"|'[^']*')|(\$[a-zA-Z_]\w*)|(~[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?|\*[a-zA-Z_]\w*)|(:[a-zA-Z_]\w*|\b[A-Z][a-zA-Z0-9_]*\b)|(\b\d+(?:\.\d+)?\b)/;
  while (rest.length) {
    const m = rest.match(pat);
    if (!m || m.index === undefined) {
      tokens.push({ t: rest });
      break;
    }
    if (m.index > 0) tokens.push({ t: rest.slice(0, m.index) });
    const v = m[0];
    let c: string | undefined;
    if (m[1]) c = "var(--color-amber)"; // string
    else if (m[2]) c = "var(--color-synapse)"; // $param
    else if (m[3]) c = "var(--color-slate)"; // *relation / ~index
    else if (m[4]) c = "#a99be0"; // :directive / Type
    else if (m[5]) c = "#d98a8a"; // number
    tokens.push({ t: v, c });
    rest = rest.slice(m.index + v.length);
  }

  tokens.forEach((tok, i) => {
    if (tok.c) {
      out.push(
        <span key={i} style={{ color: tok.c }}>
          {tok.t}
        </span>,
      );
    } else {
      // highlight keywords inside plain runs
      const parts = tok.t.split(keywords);
      parts.forEach((p, j) => {
        if (j % 2 === 1) {
          out.push(
            <span key={`${i}-${j}`} style={{ color: "var(--color-paper)" }}>
              <b style={{ fontWeight: 700 }}>{p}</b>
            </span>,
          );
        } else if (p) {
          out.push(<span key={`${i}-${j}`}>{p}</span>);
        }
      });
    }
  });

  if (comment)
    out.push(
      <span key="c" style={{ color: "var(--color-paper-faint)", fontStyle: "italic" }}>
        {comment}
      </span>,
    );
  return out;
}

function Code({
  code,
  lang,
  title,
}: {
  code: string;
  lang: "cozo" | "rust";
  title: string;
}) {
  const lines = code.split("\n");
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-2)]/90 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-synapse)]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-slate)]/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-line-bright)]" />
        </div>
        <span className="label !text-[0.62rem]">{title}</span>
      </div>
      <pre className="font-mono overflow-x-auto px-5 py-4 text-[0.82rem] leading-relaxed">
        <code>
          {lines.map((l, i) => (
            <div key={i} className="flex">
              <span className="mr-4 select-none text-right text-[var(--color-paper-faint)]/40 w-5 shrink-0">
                {i + 1}
              </span>
              <span className="text-[var(--color-paper-dim)]">
                {l ? hl(l, lang) : " "}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Hero constellation — a small synaptic graph drawn in SVG
   ────────────────────────────────────────────────────────────── */
function Constellation() {
  const nodes = [
    [40, 60],
    [120, 30],
    [110, 130],
    [200, 90],
    [270, 40],
    [290, 150],
    [185, 190],
    [60, 175],
  ] as const;
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
    [3, 5],
    [3, 6],
    [2, 7],
    [6, 5],
    [6, 7],
  ] as const;
  return (
    <svg
      viewBox="0 0 320 220"
      className="h-full w-full"
      aria-hidden
      fill="none"
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="var(--color-slate)"
          strokeOpacity={0.35}
          strokeWidth={1}
          className="draw-path"
          pathLength={1}
          style={{ animationDelay: `${0.4 + i * 0.12}s` }}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r={9}
            fill="var(--color-synapse)"
            opacity={0.08}
            className="pulse-node"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
          <circle
            cx={x}
            cy={y}
            r={3}
            fill={i % 3 === 0 ? "var(--color-synapse)" : "var(--color-slate)"}
          />
        </g>
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────── */

const HERO_CODE = `# every memory reachable from a seed, then the 12 nearest by meaning
recall[to] := *recalls{ from: $seed, to }
recall[to] := recall[via], *recalls{ from: via, to }

?[memory, dist] :=
    recall[memory],
    ~memory:embedding{ memory |
        query: $cue, k: 12, ef: 80, bind_distance: dist
    }
:order dist
:limit 12`;

const HYBRID_CODE = `use cozo::{DbInstance, GraphLeg, HybridSearch, MmrParams};

// One typed call: HNSW + FTS + graph proximity, fused natively
// with Reciprocal Rank Fusion, then MMR-diversified.
let recalls = db.hybrid_search(&HybridSearch {
    relation:     "memory".into(),
    vector_index: "embedding".into(),
    query_vector: cue,              // Vec<f32> from your embedder
    vector_k:     24,
    ef:           80,
    fts_index:    "summary_fts".into(),
    query_text:   "pricing decision",
    fts_k:        24,
    // graph leg: expand 2 hops from a seed over *recalls,
    // rank by min hop distance — fused in the same call.
    graph_legs:   vec![GraphLeg {
        edge_relation: "recalls".into(),
        seeds:         vec![seed.into()],
        max_hops:      2,
        ..GraphLeg::default()
    }],
    rrf_k:        60.0,
    mmr: Some(MmrParams { lambda: 0.5, k: 12, embedding_col: "embedding".into() }),
    ..HybridSearch::default()
})?;`;

const capabilities = [
  {
    k: "01",
    t: "Datalog, not SQL",
    d: "Queries compose piece by piece. Recursion is first-class, and runs faster than the SQL equivalent. A safe subset of aggregations is allowed inside recursion.",
  },
  {
    k: "02",
    t: "Relational · graph · vector",
    d: "One engine, one model. The relational algebra handles graph structure implicit several levels deep, with no shoehorning your data into a labelled-property graph.",
  },
  {
    k: "03",
    t: "Embeddable like SQLite",
    d: "Runs in-process (no server, no setup), yet scales to large data and high concurrency, and can also run client-server when you want it to.",
  },
  {
    k: "04",
    t: "Vector search (HNSW)",
    d: "Disk-resident HNSW indices unify with Datalog: search by meaning inside a recursive query, filter with the rest of your rules, all in one pass.",
  },
  {
    k: "05",
    t: "Full-text & near-dup",
    d: "Built-in full-text search and MinHash-LSH for near-duplicate detection: the keyword and dedup legs of retrieval, native to the engine.",
  },
  {
    k: "06",
    t: "Time travel",
    d: "Relations can carry validity time. Query the graph as it was at any historical point: memory you can rewind, not just overwrite.",
  },
];

const forkItems = [
  {
    ver: "0.8.3",
    t: "Native 3-way fused recall",
    d: "Graph proximity is now a typed leg of hybrid_search: add GraphLeg seeds and a bounded-hop edge relation, and vector, keyword, and graph signals fuse in one call, one transaction. No hand-written recursion, no app-side stitching.",
    metric: "all 3 signals in one call, ~4× faster than decomposing it by hand",
  },
  {
    ver: "0.8.3",
    t: "BM25-correct full-text search",
    d: "The default ::fts scorer is now Okapi BM25 with term-frequency saturation and document-length normalization, and OR-disjunction sums per-term contributions. avgdl is an O(1) durable counter, not a per-query index scan. (tf and tf_idf stay selectable for byte-identical upstream scoring.)",
    metric: "fused recall jumps 0.75 → 0.954, cold-start tail cut ~10× (40k chunks)",
  },
  {
    ver: "0.8.2",
    t: "Non-blocking HNSW index builds",
    d: "::hnsw create no longer holds the base relation's write lock while it constructs the graph. The graph is built off-lock under a snapshot and bulk-published via SstFileWriter; mutations during the build reconcile under a brief final lock.",
    metric: "90k reads served (slowest 0.8 ms) during a build that previously blocked them all",
  },
  {
    ver: "0.8.1",
    t: "One-call hybrid retrieval",
    d: "DbInstance::hybrid_search runs HNSW + FTS + optional graph traversal, fuses them with Reciprocal Rank Fusion, and optionally diversifies with MMR, all in a single typed call. Previously ~7 hand-written Datalog rules.",
    metric: "RRF + MMR fusion · one typed call replaces ~7 hand-written rules",
  },
  {
    ver: "0.8.1",
    t: "HNSW builds ~3× faster",
    d: "The build no longer round-trips the whole graph through the transaction's write-batch overlay. The resulting index is byte-identical to before, just built in a third of the time.",
    metric: "20k × 128-dim: 135 s → 43.6 s (release, measured)",
  },
  {
    ver: "0.8.0",
    t: "Equality pushdown",
    d: "*rel[k, ..], k == <value> now compiles to a keyed stored_prefix_join instead of a full scan. Numeric equalities keep cross-type op_eq semantics, so nothing silently changes meaning.",
    metric: "~28–29× faster single-row primary-key lookups (5k rows, measured)",
  },
  {
    ver: "0.8.0",
    t: "ULID identifiers",
    d: "rand_ulid() and ulid_timestamp() give you lexicographically-sortable, time-ordered keys, ideal for append-only memory streams you scan by recency.",
    metric: "lexicographically sortable · time-ordered scans",
  },
  {
    ver: "0.8.0",
    t: "Correctness, inherited & added",
    d: "Forked 30 commits ahead of the published 0.7.6, including the stored_prefix_join correctness fix. Plus a parser fix for identifiers that begin with a keyword (nullable_column, trueValue).",
    metric: "upstream fixes for free + a slimmer dependency graph",
  },
];

const benches = [
  { v: "100K+", u: "QPS", d: "mixed read / write / update transactions" },
  { v: "250K+", u: "QPS", d: "read-only queries" },
  { v: "<1 ms", u: "2-hop", d: "on a 1.6M-vertex, 31M-edge graph" },
  { v: "~50 MB", u: "peak RAM", d: "at OLTP load" },
];

/* Hybrid-recall benchmark — small scale (40k chunks), 1,000 queries, k=10.
   Single run 2026-05-31, macOS arm64, SQLite-backed wheel, synthetic
   embeddings. Source: mnestic-benchmarks. Numbers are hardware-specific.
   The story is capability + recall parity, not raw latency: latency is in
   the cards below, framed native-vs-native. */
const recallBench = [
  { e: "mnestic", recall: "0.954", signals: "vec · FTS · graph", locus: "native · one call", ryw: "100%", us: true },
  { e: "duckdb 1.5.3", recall: "0.957", signals: "vec · FTS · graph", locus: "app-side glue", ryw: "0% full-text †" },
  { e: "sqlite 0.1.9", recall: "1.000*", signals: "vec · FTS · graph", locus: "app-side glue", ryw: "100%" },
  { e: "lancedb 0.33", recall: "0.501", signals: "vec · FTS", locus: "native · no graph", ryw: "n/a — no graph" },
];

export default function Home() {
  return (
    <>
      <div className="field" />
      <div className="grain" />

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)]/60 bg-[var(--color-ink)]/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="transition-opacity hover:opacity-80">
            <Logo />
          </a>
          <div className="flex items-center gap-6">
            <a href="#capabilities" className="label link-grow hidden md:inline-block hover:text-[var(--color-paper)]">
              Engine
            </a>
            <a href="#fork" className="label link-grow hidden md:inline-block hover:text-[var(--color-paper)]">
              The Fork
            </a>
            <a href="#perf" className="label link-grow hidden md:inline-block hover:text-[var(--color-paper)]">
              Speed
            </a>
            <a href="#bench" className="label link-grow hidden md:inline-block hover:text-[var(--color-paper)]">
              Benchmarks
            </a>
            <a href={DOCS} className="label link-grow hover:text-[var(--color-paper)]">
              Docs
            </a>
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-[var(--color-line-bright)] px-3.5 py-1.5 font-mono text-xs text-[var(--color-paper)] transition-colors hover:border-[var(--color-synapse)] hover:text-[var(--color-synapse)]"
            >
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-6">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative grid grid-cols-1 gap-12 pt-20 pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-28">
          <div>
            <div
              className="rise mb-7 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-line-bright)] bg-[var(--color-ink-2)] px-3.5 py-1.5"
              style={{ animationDelay: "0s" }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-synapse)]" />
              <span className="font-mono text-[0.7rem] text-[var(--color-paper-dim)]">
                a maintained fork of CozoDB · v0.8.3
              </span>
            </div>

            <h1
              className="rise font-serif text-[clamp(2.7rem,6.5vw,4.7rem)] font-medium leading-[0.98] tracking-[-0.02em]"
              style={{ animationDelay: "0.08s" }}
            >
              embedded Datalog.
              <br />
              performant graphs.
              <br />
              <span className="italic text-[var(--color-synapse)]">
                a substrate for
              </span>{" "}
              <span className="italic">machine memory.</span>
            </h1>

            <p
              className="rise mt-7 max-w-xl text-lg leading-relaxed text-[var(--color-paper-dim)]"
              style={{ animationDelay: "0.16s" }}
            >
              <span className="text-[var(--color-paper)]">mnestic</span> is a
              transactional{" "}
              <span className="text-[var(--color-paper)]">
                relational–graph–vector
              </span>{" "}
              database that speaks Datalog, the same engine that called itself
              “the hippocampus for AI,” now actively maintained and tuned as the
              recall layer for agents.
            </p>

            <div
              className="rise mt-9 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "0.24s" }}
            >
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="synapse-glow rounded-md bg-[var(--color-synapse)] px-6 py-3 font-mono text-sm font-medium text-[var(--color-ink)] transition-transform hover:-translate-y-0.5"
              >
                Explore the source →
              </a>
              <a
                href={DOCS}
                className="rounded-md border border-[var(--color-line-bright)] px-6 py-3 font-mono text-sm text-[var(--color-paper)] transition-colors hover:border-[var(--color-paper-dim)]"
              >
                Read the docs →
              </a>
            </div>

            <p
              className="rise mt-6 font-mono text-xs text-[var(--color-paper-faint)]"
              style={{ animationDelay: "0.3s" }}
            >
              MPL-2.0 · Rust · RocksDB / SQLite / in-memory backends
            </p>
          </div>

          {/* Right column: constellation + hero query */}
          <div className="relative">
            <div className="pointer-events-none absolute -top-10 right-0 h-56 w-full max-w-md opacity-90 lg:-right-6">
              <Constellation />
            </div>
            <div
              className="rise relative mt-28 lg:mt-36"
              style={{ animationDelay: "0.36s" }}
            >
              <Code code={HERO_CODE} lang="cozo" title="recall.cozo — graph ∩ vector, one query" />
            </div>
          </div>
        </section>

        <div className="rule" />

        {/* ── Provenance note ───────────────────────────── */}
        <section className="grid grid-cols-1 gap-8 py-16 md:grid-cols-[auto_1fr] md:gap-14">
          <p className="label pt-1">Why a fork</p>
          <p className="max-w-3xl font-serif text-2xl leading-snug text-[var(--color-paper-dim)] md:text-[1.7rem]">
            CozoDB went quiet after{" "}
            <span className="text-[var(--color-paper)]">December 2024</span>. The
            design is too good to let drift. So we forked it,{" "}
            <span className="text-[var(--color-paper)]">openly, under MPL-2.0</span>,{" "}
            and pointed it at one job:{" "}
            <span className="italic text-[var(--color-synapse)]">
              being the memory an agent can trust.
            </span>{" "}
            Every divergence is documented, every original copyright preserved.
          </p>
        </section>

        <div className="rule" />

        {/* ── Capabilities ──────────────────────────────── */}
        <section id="capabilities" className="py-20">
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">
              The engine you inherit
            </h2>
            <p className="label hidden text-right sm:block">
              from CozoDB
              <br />
              unchanged unless noted
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <div
                key={c.k}
                className="group bg-[var(--color-ink)] p-7 transition-colors hover:bg-[var(--color-ink-2)]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-mono text-xs text-[var(--color-synapse)]">
                    {c.k}
                  </span>
                  <span className="h-px w-10 bg-[var(--color-line-bright)] transition-all group-hover:w-16 group-hover:bg-[var(--color-synapse)]" />
                </div>
                <h3 className="mb-3 font-serif text-xl font-medium">{c.t}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-paper-dim)]">
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── The Fork (the emphasis) ───────────────────── */}
        <section id="fork" className="py-20">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-synapse)]" />
            <span className="label">What mnestic adds</span>
          </div>
          <h2 className="mb-5 max-w-3xl font-serif text-4xl font-medium leading-tight tracking-tight md:text-5xl">
            Faster, safer, and built for{" "}
            <span className="italic text-[var(--color-synapse)]">recall</span>.
          </h2>
          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-[var(--color-paper-dim)]">
            The query language and semantics are unchanged. What changed is the
            stuff that bites you in production (lock contention, full scans,
            seven-rule retrieval pipelines) and the things agents actually need.
          </p>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-2">
            {forkItems.map((f, i) => (
              <div
                key={i}
                className="flex flex-col bg-[var(--color-ink)] p-7 transition-colors hover:bg-[var(--color-ink-2)]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded border border-[var(--color-synapse)]/30 bg-[var(--color-synapse)]/10 px-2 py-0.5 font-mono text-[0.68rem] text-[var(--color-synapse)]">
                    {f.ver}
                  </span>
                </div>
                <h3 className="mb-3 font-serif text-2xl font-medium leading-tight">
                  {f.t}
                </h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--color-paper-dim)]">
                  {f.d}
                </p>
                <p className="border-t border-[var(--color-line)] pt-4 font-mono text-xs leading-relaxed text-[var(--color-slate)]">
                  → {f.metric}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Marquee feature: hybrid_search ────────────── */}
        <section className="grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="label">The headline feature</span>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-tight tracking-tight md:text-[2.9rem]">
              Hybrid retrieval,
              <br />
              <span className="italic text-[var(--color-synapse)]">
                one typed call.
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-paper-dim)]">
              Vector similarity, keyword match, and graph proximity are three
              different signals about <em>“what should I remember right now.”</em>{" "}
              As of 0.8.3 mnestic fuses all three <em>natively</em>: a typed{" "}
              graph leg joins the vector and keyword legs in one call, combined by
              Reciprocal Rank Fusion and de-duplicated by Maximal Marginal
              Relevance.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Graph proximity is a typed GraphLeg: bounded-hop, ranked by min distance",
                "Query vector, text & seeds passed as params, never string-interpolated",
                "One call, one transaction; generated CozoScript inspectable via hybrid_search_script",
              ].map((li) => (
                <li key={li} className="flex gap-3 text-sm text-[var(--color-paper-dim)]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-synapse)]" />
                  {li}
                </li>
              ))}
            </ul>
          </div>
          <Code code={HYBRID_CODE} lang="rust" title="hybrid recall — RRF + MMR in one call" />
        </section>

        <div className="rule" />

        {/* ── Performance ───────────────────────────────── */}
        <section id="perf" className="py-20">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">
              Built to be fast
            </h2>
            <p className="label max-w-xs text-right">
              upstream figures · 2020 Mac mini · RocksDB backend
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-line)] lg:grid-cols-4">
            {benches.map((b) => (
              <div key={b.d} className="bg-[var(--color-ink)] p-7">
                <div className="font-serif text-[2.6rem] font-medium leading-none tracking-tight text-[var(--color-paper)]">
                  {b.v}
                </div>
                <div className="mt-1 font-mono text-xs uppercase tracking-widest text-[var(--color-synapse)]">
                  {b.u}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-[var(--color-paper-dim)]">
                  {b.d}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 font-mono text-xs text-[var(--color-paper-faint)]">
            Backup ≈ 1M rows/s · restore ≈ 400K rows/s · PageRank on 1.6M
            vertices ≈ 30 s. mnestic keeps these and adds the fork wins above.
          </p>
        </section>

        <div className="rule" />

        {/* ── Hybrid-recall benchmark ───────────────────── */}
        <section id="bench" className="py-20">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-synapse)]" />
            <span className="label">Hybrid recall, measured</span>
          </div>
          <h2 className="mb-5 max-w-3xl font-serif text-4xl font-medium leading-tight tracking-tight md:text-5xl">
            One engine for all three{" "}
            <span className="italic text-[var(--color-synapse)]">signals</span>.
          </h2>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[var(--color-paper-dim)]">
            The task is fusing vector, keyword, <em>and</em> graph proximity into
            one ranking. Raw latency isn&apos;t what separates the field at this
            scale. Three structural things are, and mnestic is the only embedded
            engine here that gets all three right.
          </p>

          <div className="mb-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-3">
            {[
              {
                n: "01",
                t: "It has a graph signal at all",
                d: "Graph proximity is correlated but distinct from vector and keyword: drop it and you lose recall the other two can't recover. It's the single largest effect in the run, with the graph-less engines (LanceDB) landing far below. This is why graph-augmented retrieval exists.",
              },
              {
                n: "02",
                t: "One store, one call, no glue",
                d: "mnestic serves all three signals from one embedded store and fuses them in a single transactional call. SQLite, DuckDB and Kuzu keep them in one process but fuse in app code (three queries + a hand-rolled RRF); LanceDB fuses natively but needs a second system for graph.",
              },
              {
                n: "03",
                t: "Read-your-writes on every signal",
                d: "An agent writes a memory and must recall it immediately. mnestic's indexes update in the same transaction, giving 100% fused read-your-writes. DuckDB's full-text index is a build-time snapshot: a new memory is unsearchable by keyword (0%) until a rebuild. A static-corpus drag race hides this entirely.",
              },
            ].map((p) => (
              <div key={p.n} className="bg-[var(--color-ink)] p-7">
                <span className="font-mono text-xs text-[var(--color-synapse)]">
                  {p.n}
                </span>
                <h3 className="mb-3 mt-4 font-serif text-lg font-medium leading-snug">
                  {p.t}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-paper-dim)]">
                  {p.d}
                </p>
              </div>
            ))}
          </div>

          <p className="mb-6 max-w-2xl text-base leading-relaxed text-[var(--color-paper-dim)]">
            On quality, mnestic hits{" "}
            <strong className="text-[var(--color-paper)]">recall@10 of 0.954</strong>,
            level with DuckDB&apos;s 0.957 and far above the graph-less LanceDB
            (0.501). It&apos;s the only engine here that fuses all three signals in
            one transaction:
          </p>

          <div className="overflow-x-auto rounded-xl border border-[var(--color-line)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-ink-2)]">
                  <th className="label px-5 py-3 font-normal">Engine</th>
                  <th className="label px-5 py-3 text-right font-normal">recall@10</th>
                  <th className="label px-5 py-3 font-normal">Signals</th>
                  <th className="label px-5 py-3 font-normal">Fusion</th>
                  <th className="label px-5 py-3 font-normal">Fused read-your-writes</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[0.82rem]">
                {recallBench.map((r) => (
                  <tr
                    key={r.e}
                    className={`border-b border-[var(--color-line)] last:border-0 ${
                      r.us ? "bg-[var(--color-synapse)]/5" : ""
                    }`}
                  >
                    <td
                      className={`px-5 py-3 ${
                        r.us
                          ? "font-medium text-[var(--color-synapse)]"
                          : "text-[var(--color-paper)]"
                      }`}
                    >
                      {r.e}
                    </td>
                    <td className="px-5 py-3 text-right text-[var(--color-paper)]">
                      {r.recall}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-paper-dim)]">
                      {r.signals}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-paper-dim)]">
                      {r.locus}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-paper-dim)]">
                      {r.ryw}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-2">
            <div className="bg-[var(--color-ink)] p-7">
              <h3 className="mb-3 font-serif text-xl font-medium">
                The native call is the fast path
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-paper-dim)]">
                mnestic&apos;s one-call 3-way fusion runs at{" "}
                <span className="font-mono text-[var(--color-paper)]">~42 ms p50</span>,{" "}
                <strong className="text-[var(--color-paper)]">faster than
                DuckDB&apos;s decomposed path</strong> and about 4× faster than
                hand-decomposing it yourself. It&apos;s the only engine here that
                fuses three signals in a single call; LanceDB&apos;s native call
                covers just two.
              </p>
            </div>
            <div className="bg-[var(--color-ink)] p-7">
              <h3 className="mb-3 font-serif text-xl font-medium">
                Latency, in context
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-paper-dim)]">
                mnestic isn&apos;t the lowest absolute latency at this scale, but
                the numbers hold up off the test wheel. Re-measured on the{" "}
                <span className="font-mono text-[var(--color-paper)]">RocksDB</span>{" "}
                backend it actually runs, with{" "}
                <span className="text-[var(--color-paper)]">real
                sentence-transformer embeddings</span>, the decomposed path&apos;s
                tail falls (p99{" "}
                <span className="font-mono text-[var(--color-paper)]">181 ms</span>{" "}
                vs 258 on the wheel) and the native 3-way call stays around
                40 ms. What holds is quality and capability: matching the best
                indexed engine while fusing a signal the others can&apos;t.
              </p>
            </div>
          </div>

          <p className="mt-5 font-mono text-xs leading-relaxed text-[var(--color-paper-faint)]">
            † DuckDB&apos;s full-text index is a build-time snapshot — its fused
            read-your-writes is 99% overall but 0% for the keyword leg until a
            rebuild.{" "}
            Source: the mnestic-benchmarks hybrid suite, summarized in the{" "}
            <a
              href={`${GITHUB}/blob/main/CHANGELOG-FORK.md`}
              target="_blank"
              rel="noreferrer"
              className="link-grow text-[var(--color-paper-dim)]"
            >
              0.8.3 changelog
            </a>
. Small scale (40k chunks, 10k entities, 50k edges, dim 384) · 1,000
            queries, k=10, 2-hop graph · 2026-05-31 · macOS arm64. Numbers are
            hardware-specific.{" "}
            <strong className="text-[var(--color-paper-dim)]">Recall@10</strong>{" "}
            is the synthetic text-derived-embedding run on the SQLite-backed wheel,
            where the vector signal is meaningful by construction;{" "}
            <strong className="text-[var(--color-paper-dim)]">latency</strong>{" "}
            is additionally validated on the RocksDB backend with real
            sentence-transformer embeddings. *SQLite&apos;s recall reflects an
            exact brute-force KNN scan (no ANN index), not a like-for-like indexed
            search. Kuzu did not complete (extension host offline since its
            Oct-2025 archival).
          </p>
        </section>

        <div className="rule" />

        {/* ── Get started ───────────────────────────────── */}
        <section className="py-20">
          <h2 className="mb-10 font-serif text-4xl font-medium tracking-tight md:text-5xl">
            Add it to your Rust project
          </h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <Code
                lang="rust"
                title="Cargo.toml — the importable name stays cozo"
                code={`# default = in-memory + SQLite backends
cargo add mnestic

# or, with the RocksDB backend:
# mnestic = { version = "0.8", features = ["storage-rocksdb"] }`}
              />
              <Code
                lang="rust"
                title="main.rs"
                code={`use cozo::DbInstance;

let db = DbInstance::new("mem", "", "")?;
db.run_default("?[x] := x in [1, 2, 3]")?;`}
              />
            </div>
            <div className="flex flex-col justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-2)] p-8">
              <p className="label mb-4">Naming, on purpose</p>
              <p className="text-[var(--color-paper-dim)] leading-relaxed">
                The published crate is{" "}
                <a
                  href={CRATE}
                  target="_blank"
                  rel="noreferrer"
                  className="link-grow text-[var(--color-paper)]"
                >
                  mnestic
                </a>
                , but the importable library name stays{" "}
                <code className="rounded bg-[var(--color-ink)] px-1.5 py-0.5 font-mono text-sm text-[var(--color-synapse)]">
                  cozo
                </code>
                . Every <code className="font-mono text-sm text-[var(--color-paper)]">use cozo::…</code>{" "}
                in your existing code, and in downstream crates, keeps working
                unchanged. A drop-in, not a rewrite.
              </p>
            </div>
          </div>
        </section>

        <div className="rule" />

        {/* ── Attribution ───────────────────────────────── */}
        <section className="py-20">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink-2)] p-8 md:p-12">
            <p className="label mb-5">Credit where it’s due</p>
            <p className="max-w-3xl font-serif text-2xl leading-snug text-[var(--color-paper-dim)] md:text-[1.7rem]">
              mnestic is <span className="text-[var(--color-paper)]">not</span> the
              official CozoDB and is not affiliated with or endorsed by its
              authors. All credit for the original design belongs to{" "}
              <span className="text-[var(--color-paper)]">Ziyang Hu</span> and the{" "}
              <span className="text-[var(--color-paper)]">Cozo Project Authors</span>.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <a href={UPSTREAM} target="_blank" rel="noreferrer" className="label link-grow hover:text-[var(--color-paper)]">
                Original project ↗
              </a>
              <a href={`${GITHUB}/blob/main/FORK.md`} target="_blank" rel="noreferrer" className="label link-grow hover:text-[var(--color-paper)]">
                FORK.md — provenance & licensing ↗
              </a>
              <a href={`${GITHUB}/blob/main/CHANGELOG-FORK.md`} target="_blank" rel="noreferrer" className="label link-grow hover:text-[var(--color-paper)]">
                Full changelog of divergences ↗
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-line)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Mark size={22} />
            <span className="font-serif text-lg font-medium">mnestic</span>
            <span className="hidden font-mono text-xs text-[var(--color-paper-faint)] sm:inline">
              the hippocampus for AI, maintained
            </span>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            <a href={GITHUB} target="_blank" rel="noreferrer" className="label link-grow hover:text-[var(--color-paper)]">
              GitHub
            </a>
            <a href={CRATE} target="_blank" rel="noreferrer" className="label link-grow hover:text-[var(--color-paper)]">
              crates.io
            </a>
            <a href={DOCS} className="label link-grow hover:text-[var(--color-paper)]">
              Docs
            </a>
            <span className="label">MPL-2.0</span>
          </div>
        </div>
        <p className="mx-auto max-w-6xl px-6 pb-10 font-mono text-[0.68rem] leading-relaxed text-[var(--color-paper-faint)]">
          Documentation adapted from the original CozoDB docs (CC-BY-SA-4.0),
          with original pages for the fork&apos;s additions. The query language is
          unchanged.
        </p>
      </footer>
    </>
  );
}
