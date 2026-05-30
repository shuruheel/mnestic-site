import type { ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────
   Links
   ────────────────────────────────────────────────────────────── */
const GITHUB = "https://github.com/shuruheel/mnestic";
const DOCS = "https://docs.cozodb.org/en/latest/index.html";
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

const HYBRID_CODE = `use cozo::{DbInstance, HybridSearch, MmrParams};

// One typed call: HNSW + FTS (+ optional graph traversal),
// fused with Reciprocal Rank Fusion, then MMR-diversified.
let recalls = db.hybrid_search(&HybridSearch {
    relation:     "memory".into(),
    vector_index: "embedding".into(),
    query_vector: cue,              // Vec<f32> from your embedder
    vector_k:     24,
    ef:           80,
    fts_index:    "summary_fts".into(),
    query_text:   "pricing decision",
    fts_k:        24,
    rrf_k:        60.0,
    mmr: Some(MmrParams { lambda: 0.5, k: 12, embedding_col: "embedding".into() }),
    ..HybridSearch::default()
})?;`;

const capabilities = [
  {
    k: "01",
    t: "Datalog, not SQL",
    d: "Queries compose piece by piece. Recursion is first-class — and runs faster than the SQL equivalent. A safe subset of aggregations is allowed inside recursion.",
  },
  {
    k: "02",
    t: "Relational · graph · vector",
    d: "One engine, one model. The relational algebra handles graph structure implicit several levels deep — no shoehorning your data into a labelled-property graph.",
  },
  {
    k: "03",
    t: "Embeddable like SQLite",
    d: "Runs in-process — no server, no setup — yet scales to large data and high concurrency, and can also run client-server when you want it to.",
  },
  {
    k: "04",
    t: "Vector search (HNSW)",
    d: "Disk-resident HNSW indices unify with Datalog: search by meaning inside a recursive query, filter with the rest of your rules, all in one pass.",
  },
  {
    k: "05",
    t: "Full-text & near-dup",
    d: "Built-in full-text search and MinHash-LSH for near-duplicate detection — the keyword and dedup legs of retrieval, native to the engine.",
  },
  {
    k: "06",
    t: "Time travel",
    d: "Relations can carry validity time. Query the graph as it was at any historical point — memory you can rewind, not just overwrite.",
  },
];

const forkItems = [
  {
    ver: "0.8.2",
    t: "Non-blocking HNSW index builds",
    d: "::hnsw create no longer holds the base relation's write lock while it constructs the graph. The graph is built off-lock under a snapshot and bulk-published via SstFileWriter; mutations during the build reconcile under a brief final lock.",
    metric: "90,507 reads served (slowest 0.8 ms) during a 5.6 s, 40k-vector build that previously blocked them all",
  },
  {
    ver: "0.8.1",
    t: "One-call hybrid retrieval",
    d: "DbInstance::hybrid_search runs HNSW + FTS + optional graph traversal, fuses them with Reciprocal Rank Fusion, and optionally diversifies with MMR — in a single typed call. Previously ~7 hand-written Datalog rules.",
    metric: "RRF + MMR fusion · one typed call replaces ~7 hand-written rules",
  },
  {
    ver: "0.8.1",
    t: "HNSW builds ~3× faster",
    d: "The build no longer round-trips the whole graph through the transaction's write-batch overlay. The resulting index is byte-identical to before — just built in a third of the time.",
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
    d: "rand_ulid() and ulid_timestamp() give you lexicographically-sortable, time-ordered keys — ideal for append-only memory streams that you scan by recency.",
    metric: "lexicographically sortable · time-ordered scans",
  },
  {
    ver: "0.8.0",
    t: "Correctness, inherited & added",
    d: "Forked 30 commits ahead of the published 0.7.6 — including the stored_prefix_join correctness fix. Plus a parser fix for identifiers that begin with a keyword (nullable_column, trueValue).",
    metric: "upstream fixes for free + a slimmer dependency graph",
  },
];

const benches = [
  { v: "100K+", u: "QPS", d: "mixed read / write / update transactions" },
  { v: "250K+", u: "QPS", d: "read-only queries" },
  { v: "<1 ms", u: "2-hop", d: "on a 1.6M-vertex, 31M-edge graph" },
  { v: "~50 MB", u: "peak RAM", d: "at OLTP load" },
];

export default function Home() {
  return (
    <>
      <div className="field" />
      <div className="grain" />

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)]/60 bg-[var(--color-ink)]/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-medium tracking-tight">
              mnestic
            </span>
            <span className="hidden h-1.5 w-1.5 rounded-full bg-[var(--color-synapse)] sm:block" />
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
            <a href={DOCS} target="_blank" rel="noreferrer" className="label link-grow hover:text-[var(--color-paper)]">
              Docs ↗
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
                a maintained fork of CozoDB · v0.8.2
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
              database that speaks Datalog — the same engine that called itself
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
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[var(--color-line-bright)] px-6 py-3 font-mono text-sm text-[var(--color-paper)] transition-colors hover:border-[var(--color-paper-dim)]"
              >
                Read the docs ↗
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
            design is too good to let drift. So we forked it —{" "}
            <span className="text-[var(--color-paper)]">openly, under MPL-2.0</span>{" "}
            — and pointed it at one job:{" "}
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
            stuff that bites you in production — lock contention, full scans,
            seven-rule retrieval pipelines — and the things agents actually need.
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
              mnestic fuses them for you — Reciprocal Rank Fusion to combine,
              Maximal Marginal Relevance to keep the results from collapsing into
              near-duplicates.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Query vector & text passed as params — never string-interpolated",
                "Generated CozoScript inspectable via hybrid_search_script",
                "Fold in your own n-hop traversal as an extra ranked list",
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
                in your existing code — and in downstream crates — keeps working
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
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-medium">mnestic</span>
            <span className="font-mono text-xs text-[var(--color-paper-faint)]">
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
            <a href={DOCS} target="_blank" rel="noreferrer" className="label link-grow hover:text-[var(--color-paper)]">
              Docs ↗
            </a>
            <span className="label">MPL-2.0</span>
          </div>
        </div>
        <p className="mx-auto max-w-6xl px-6 pb-10 font-mono text-[0.68rem] leading-relaxed text-[var(--color-paper-faint)]">
          Documentation currently points to the original CozoDB docs — the query
          language is unchanged. A mnestic-specific docs site is on the way.
        </p>
      </footer>
    </>
  );
}
