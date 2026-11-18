import type { ReactNode } from "react";
import { Logo, Mark } from "./logo";

/* ──────────────────────────────────────────────────────────────
   Links
   ────────────────────────────────────────────────────────────── */
const GITHUB = "https://github.com/shuruheel/mnestic";
const BENCHMARKS = "https://github.com/shuruheel/mnestic-benchmarks";
const DOCS = "/docs";
const CRATE = "https://crates.io/crates/mnestic";
const UPSTREAM = "https://github.com/cozodb/cozo";

/* ──────────────────────────────────────────────────────────────
   Tiny syntax highlighter for the code blocks (no client JS).
   Tokenizes a small CozoScript / Rust subset into colored spans.
   ────────────────────────────────────────────────────────────── */
type Tok = { t: string; c?: string };

function hl(line: string, lang: "cozo" | "rust" | "python"): ReactNode[] {
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
  lang: "cozo" | "rust" | "python";
  title: string;
}) {
  const lines = code.split("\n");
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-2)]">
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

const BITEMP_CODE = `# opt in: valid time + an engine-stamped transaction time
:create beliefs {claim, vld: Validity, tt: TxTime => conf: Float}

# the engine stamps tt at commit; callers never set it
?[c, v, conf] <- [['q3 pipeline is healthy', '2026-09-01', 0.35]]
:put beliefs {c, v => conf}

# what did we believe on June 30 about September?
?[conf] := *beliefs{claim: 'q3 pipeline is healthy', conf
                    @ (vt: '2026-09-01', tt: '2026-06-30')}

# the audit trail: every belief, correction, and cessation
::history beliefs [['q3 pipeline is healthy']]`;

const HYBRID_CODE = `use cozo::{DbInstance, GraphLeg, HybridSearch, MmrParams};

// HNSW + full-text + graph proximity in one call,
// fused with reciprocal rank fusion, then MMR.
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
    // ranked by hop distance and fused in the same call.
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
    t: "Datalog, not SQL",
    d: "Queries compose rule by rule, and recursion is built in. A safe subset of aggregations works inside recursion.",
  },
  {
    t: "Relational, graph, and vector",
    d: "One data model covers all three. Graph structure is just relations and rules, so there is no separate property-graph schema to maintain.",
  },
  {
    t: "Embedded like SQLite",
    d: "Runs in your process with no server and no setup. It can also run as a server when you need one.",
  },
  {
    t: "Vector search",
    d: "Disk-resident HNSW indexes join Datalog directly, so a nearest-neighbour search can sit inside a recursive query and be filtered by any other rule.",
  },
  {
    t: "Full-text and near-duplicates",
    d: "BM25 full-text search and MinHash-LSH near-duplicate detection are part of the engine, not extensions.",
  },
  {
    t: "History on two time axes",
    d: "A relation can record when a fact was true and when the database learned it. Query either axis, or both.",
  },
];

/* Highlights from the fork's release history. The full list lives at
   /docs/release-notes; this section is not a changelog and does not get a
   new entry per release. */
const forkItems = [
  {
    ver: "0.13.1",
    t: "Counts a join without building it",
    metric: "LSQB q1 72.4 s → 1.05 s, q6 42.1 s → 0.31 s, same answers",
  },
  {
    ver: "0.10.5",
    t: "Reorders naive joins before running them",
    metric: "54.5× on the reported query, results unchanged",
  },
  {
    ver: "0.11.0",
    t: "Caches a graph once for twelve algorithms",
    metric: "PageRank 15× and connected components 16× at 400k edges",
  },
  {
    ver: "0.19.2",
    t: "Faster writes and complete filtered vector search",
    metric: "update p50 300 → 20 ms; filtered recall 0.18 → 1.0 (SQLite, 40,000 rows)",
  },
  {
    ver: "0.12.0",
    t: "Fills a context window from the graph in one call",
    metric: "cheapest-first expansion under a hard node budget, 2–4× faster than a host-side loop",
  },
  {
    ver: "0.10.0",
    t: "Returns the evidence behind each answer",
    metric: "the k best derivations per result, each with its chain of facts",
  },
  {
    ver: "0.12.1–0.13.0",
    t: "Fixes bugs inherited from upstream",
    metric:
      "a failed commit reported as success, full-text postings leaking on update, timestamps silently stored as 1970, RocksDB options ignored on open",
  },
];

/* Hybrid-recall benchmark: small scale (40k chunks), 1,000 queries, k=10.
   Single run 2026-05-31, macOS arm64, SQLite-backed wheel, synthetic
   embeddings. Source: mnestic-benchmarks. Numbers are hardware-specific. */
const recallBench = [
  { e: "mnestic", recall: "0.954", signals: "vector, full-text, graph", locus: "in the engine, one call", ryw: "100%", us: true },
  { e: "duckdb 1.5.3", recall: "0.957", signals: "vector, full-text, graph", locus: "in app code", ryw: "0% full-text †" },
  { e: "sqlite 0.1.9", recall: "1.000*", signals: "vector, full-text, graph", locus: "in app code", ryw: "100%" },
  { e: "lancedb 0.33", recall: "0.501", signals: "vector, full-text", locus: "in the engine, no graph", ryw: "n/a, no graph" },
];

const comparisonRows = [
  {
    dim: "Where it runs",
    pg: "Separate server",
    dd: "In your process",
    neo: "Separate server (JVM)",
    us: "In your process, or as a server",
  },
  {
    dim: "Long chains of links",
    pg: "Recursive CTEs, slow as chains grow",
    dd: "Not supported",
    neo: "Good for paths, weaker for general recursive rules",
    us: "Recursive Datalog rules",
  },
  {
    dim: "Meaning, keyword, and link search in one request",
    pg: "pgvector and full-text, combined by you",
    dd: "Vector and full-text extensions, no graph",
    neo: "Vector index, combined with the rest by you",
    us: "One call, fused and ranked by the engine",
  },
  {
    dim: "What used to be true",
    pg: "Build it yourself",
    dd: "Build it yourself",
    neo: "Build it yourself",
    us: "Built in, on two time axes",
  },
];

const useCases = [
  {
    t: "Agent memory across sessions",
    d: "An agent needs to recall last week's decision by meaning, by exact words, and by what it is linked to. In mnestic that is the single query in the hero, and it sees writes from a second ago.",
  },
  {
    t: "Audit trails",
    d: "A transaction was rated low risk in June and looks wrong in September. With transaction time you can replay exactly what the system knew in June, and nobody can backdate it.",
  },
  {
    t: "Graphs without a second database",
    d: "Fraud rings share devices, addresses, and cards several hops from the flagged account. Recursive rules find those links in the same database that holds the rest of your data.",
  },
];

const H2 = "font-serif text-4xl font-medium leading-tight tracking-tight md:text-5xl";
const LEAD = "max-w-2xl text-lg leading-relaxed text-[var(--color-paper-dim)]";
const NOTE = "font-mono text-xs leading-relaxed text-[var(--color-paper-faint)]";

export default function Home() {
  return (
    <>
      <div className="field" />
      <div className="grain" />

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)]/60 bg-[var(--color-ink)]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="transition-opacity hover:opacity-80">
            <Logo />
          </a>
          <div className="flex items-center gap-6">
            <a href="#compare" className="label link-grow hidden md:inline-block hover:text-[var(--color-paper)]">
              Compare
            </a>
            <a href="#fork" className="label link-grow hidden md:inline-block hover:text-[var(--color-paper)]">
              The fork
            </a>
            <a href="#bench" className="label link-grow hidden md:inline-block hover:text-[var(--color-paper)]">
              Benchmark
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
            <p className="rise mb-7 font-mono text-[0.75rem] text-[var(--color-paper-dim)]" style={{ animationDelay: "0s" }}>
              a maintained fork of CozoDB · v0.19.4
            </p>

            <h1
              className="rise font-serif text-[clamp(2.7rem,6.5vw,4.7rem)] font-medium leading-[0.98] tracking-[-0.02em]"
              style={{ animationDelay: "0.08s" }}
            >
              An embedded Datalog database for agent memory.
            </h1>

            <p
              className="rise mt-7 max-w-xl text-lg leading-relaxed text-[var(--color-paper-dim)]"
              style={{ animationDelay: "0.16s" }}
            >
              mnestic stores relations, graphs, and vectors in one transactional engine that runs inside your
              process. It continues CozoDB, which called itself &ldquo;the hippocampus for AI,&rdquo; and is tuned
              for recall: search by meaning, keyword, and link in one query, and keep the history of every fact if you want it.
            </p>

            <div className="rise mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "0.24s" }}>
              <a
                href={DOCS}
                className="rounded-md bg-[var(--color-synapse)] px-6 py-3 font-mono text-sm font-medium text-[var(--color-ink)] transition-colors hover:opacity-90"
              >
                Read the docs
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[var(--color-line-bright)] px-6 py-3 font-mono text-sm text-[var(--color-paper)] transition-colors hover:border-[var(--color-paper-dim)]"
              >
                View on GitHub
              </a>
            </div>

            <p className="rise mt-6 font-mono text-xs text-[var(--color-paper-faint)]" style={{ animationDelay: "0.3s" }}>
              MPL-2.0 · Rust and Python · RocksDB, SQLite, or in-memory storage
            </p>
          </div>

          {/* Right column: constellation + hero query */}
          <div className="relative">
            <div className="pointer-events-none absolute -top-10 right-0 h-56 w-full max-w-md opacity-90 lg:-right-6">
              <Constellation />
            </div>
            <div className="rise relative mt-28 lg:mt-36" style={{ animationDelay: "0.36s" }}>
              <Code code={HERO_CODE} lang="cozo" title="recall.cozo · graph and vector in one query" />
            </div>
          </div>
        </section>

        <div className="rule" />

        {/* ── Why a fork ────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-8 py-16 md:grid-cols-[auto_1fr] md:gap-14">
          <p className="label pt-1">Why a fork</p>
          <p className="max-w-3xl font-serif text-2xl leading-snug text-[var(--color-paper-dim)] md:text-[1.7rem]">
            CozoDB has had no release since <span className="text-[var(--color-paper)]">December 2024</span>. We
            forked it under the same MPL-2.0 license to keep it maintained and to tune it for agent memory. Every
            change from upstream is documented, and every original copyright is kept.
          </p>
        </section>

        <div className="rule" />

        {/* ── Comparison: Postgres / DuckDB / Neo4j ─────── */}
        <section id="compare" className="py-20">
          <h2 className={`mb-5 max-w-3xl ${H2}`}>Compared with Postgres, DuckDB, and Neo4j.</h2>
          <p className={`mb-10 ${LEAD}`}>
            Each is good at its own job. None of them does all of this inside your process: one request that
            searches by meaning, keyword, and link; long recursive chains; and a record of what used to be true.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[var(--color-line)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-ink-2)]">
                  <th className="label px-5 py-3 font-normal"></th>
                  <th className="label px-5 py-3 font-normal">Postgres</th>
                  <th className="label px-5 py-3 font-normal">DuckDB</th>
                  <th className="label px-5 py-3 font-normal">Neo4j</th>
                  <th className="label px-5 py-3 font-normal">mnestic</th>
                </tr>
              </thead>
              <tbody className="text-[0.82rem]">
                {comparisonRows.map((r) => (
                  <tr key={r.dim} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="px-5 py-4 font-medium text-[var(--color-paper)]">{r.dim}</td>
                    <td className="px-5 py-4 text-[var(--color-paper-dim)]">{r.pg}</td>
                    <td className="px-5 py-4 text-[var(--color-paper-dim)]">{r.dd}</td>
                    <td className="px-5 py-4 text-[var(--color-paper-dim)]">{r.neo}</td>
                    <td className="bg-[var(--color-synapse)]/5 px-5 py-4 font-medium text-[var(--color-paper)]">{r.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`mt-5 ${NOTE}`}>
            Structural differences, not a speed test. Each column uses that database&apos;s official tooling:
            pgvector and full-text search for Postgres, the vector and full-text extensions for DuckDB, Cypher and
            the vector index for Neo4j.
          </p>
        </section>

        <div className="rule" />

        {/* ── What you inherit from CozoDB ──────────────── */}
        <section id="capabilities" className="py-20">
          <h2 className={`mb-12 ${H2}`}>What you get from CozoDB.</h2>
          <dl className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <div key={c.t} className="border-t border-[var(--color-line)] pt-5">
                <dt className="mb-2 font-serif text-xl font-medium">{c.t}</dt>
                <dd className="text-sm leading-relaxed text-[var(--color-paper-dim)]">{c.d}</dd>
              </div>
            ))}
          </dl>
          <p className={`mt-10 ${NOTE}`}>
            Upstream measured 100K+ QPS on mixed read and write transactions, 250K+ QPS read-only, and under 1 ms for
            a two-hop query on a graph of 1.6M vertices and 31M edges (2020 Mac mini, RocksDB).
          </p>
        </section>

        <div className="rule" />

        {/* ── The fork ──────────────────────────────────── */}
        <section id="fork" className="py-20">
          <h2 className={`mb-5 max-w-3xl ${H2}`}>What the fork adds.</h2>
          <p className={`mb-12 ${LEAD}`}>
            The query language is unchanged. The work has gone into query speed, correctness, and the operations
            agent memory needs. A few of the measured changes:
          </p>

          <ul className="border-t border-[var(--color-line)]">
            {forkItems.map((f) => (
              <li
                key={f.ver}
                className="grid grid-cols-1 gap-2 border-b border-[var(--color-line)] py-5 md:grid-cols-[8rem_1fr_1.2fr] md:gap-8"
              >
                <span className="font-mono text-xs text-[var(--color-synapse)]">{f.ver}</span>
                <span className="font-serif text-lg font-medium leading-snug">{f.t}</span>
                <span className="font-mono text-xs leading-relaxed text-[var(--color-paper-dim)]">{f.metric}</span>
              </li>
            ))}
          </ul>
          <p className={`mt-6 ${NOTE}`}>
            <a href="/docs/release-notes" className="link-grow text-[var(--color-paper-dim)]">
              Every fork release since 0.8.0
            </a>
          </p>
        </section>

        <div className="rule" />

        {/* ── Bitemporality ─────────────────────────────── */}
        <section className="grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight md:text-[2.9rem]">
              What did we believe in June about September?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-paper-dim)]">
              Valid time is when a fact holds in the world. Transaction time is when the database learned it, and
              the engine stamps it at commit. With both, you can reproduce an old answer exactly and tell a change in
              the world apart from a correction.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Transaction time is set by the engine, never by the caller, so history cannot be backdated.",
                "::history, ::history_gc and ::evict manage the record; garbage collection keeps as-of reads exact.",
                "Opt-in per relation. Current-value reads run within about 4–12% of a plain relation.",
              ].map((li) => (
                <li key={li} className="flex gap-3 text-sm text-[var(--color-paper-dim)]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-synapse)]" />
                  {li}
                </li>
              ))}
            </ul>
          </div>
          <Code code={BITEMP_CODE} lang="cozo" title="beliefs.cozo · two time axes" />
        </section>

        <div className="rule" />

        {/* ── Hybrid search ─────────────────────────────── */}
        <section className="grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight md:text-[2.9rem]">
              Vector, keyword, and graph search in one call.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-paper-dim)]">
              <code className="font-mono text-base text-[var(--color-paper)]">hybrid_search</code> runs all three
              searches in one transaction, merges them with reciprocal rank fusion, and can drop near-duplicates with
              MMR. Query vectors, text, and seeds go in as parameters, never as interpolated strings.
            </p>
          </div>
          <Code code={HYBRID_CODE} lang="rust" title="main.rs · hybrid_search" />
        </section>

        <div className="rule" />

        {/* ── Hybrid-recall benchmark ───────────────────── */}
        <section id="bench" className="py-20">
          <h2 className={`mb-5 max-w-3xl ${H2}`}>Recall, measured.</h2>
          <p className={`mb-10 ${LEAD}`}>
            On 40,000 chunks and 1,000 queries, mnestic&apos;s recall@10 is 0.954, level with DuckDB and far above
            LanceDB, which has no graph signal. The difference is where the work happens: mnestic fuses all three
            signals in one call, so a new memory is searchable on every signal the moment it is written.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[var(--color-line)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-ink-2)]">
                  <th className="label px-5 py-3 font-normal">Engine</th>
                  <th className="label px-5 py-3 text-right font-normal">recall@10</th>
                  <th className="label px-5 py-3 font-normal">Signals</th>
                  <th className="label px-5 py-3 font-normal">Fusion</th>
                  <th className="label px-5 py-3 font-normal">Searchable right after a write</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[0.82rem]">
                {recallBench.map((r) => (
                  <tr
                    key={r.e}
                    className={`border-b border-[var(--color-line)] last:border-0 ${r.us ? "bg-[var(--color-synapse)]/5" : ""}`}
                  >
                    <td className={`px-5 py-3 ${r.us ? "font-medium text-[var(--color-synapse)]" : "text-[var(--color-paper)]"}`}>
                      {r.e}
                    </td>
                    <td className="px-5 py-3 text-right text-[var(--color-paper)]">{r.recall}</td>
                    <td className="px-5 py-3 text-[var(--color-paper-dim)]">{r.signals}</td>
                    <td className="px-5 py-3 text-[var(--color-paper-dim)]">{r.locus}</td>
                    <td className="px-5 py-3 text-[var(--color-paper-dim)]">{r.ryw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--color-paper-dim)]">
            The fused call takes about <span className="font-mono text-[var(--color-paper)]">42 ms</span> at p50,
            roughly 4× faster than running the same three searches separately. It is not the lowest latency in the
            table.
          </p>

          <p className={`mt-5 ${NOTE}`}>
            † DuckDB&apos;s full-text index is built once and misses new rows until it is rebuilt. *SQLite&apos;s
            recall comes from an exact brute-force scan, not an approximate index. 40k chunks, 1,000 queries, k=10,
            two-hop graph; 2026-05-31, macOS arm64; numbers are hardware-specific. Recall uses synthetic embeddings
            on the SQLite build; latency was checked separately on RocksDB with real sentence-transformer
            embeddings. Kùzu is excluded because its extension host has been offline since the project was archived
            in October 2025.{" "}
            <a
              href={`${BENCHMARKS}/blob/main/docs/METHODOLOGY.md`}
              target="_blank"
              rel="noreferrer"
              className="link-grow text-[var(--color-paper-dim)]"
            >
              Methodology
            </a>{" "}
            ·{" "}
            <a
              href={`${BENCHMARKS}/blob/main/docs/RESULTS.md`}
              target="_blank"
              rel="noreferrer"
              className="link-grow text-[var(--color-paper-dim)]"
            >
              raw results
            </a>
          </p>
        </section>

        <div className="rule" />

        {/* ── Use cases ──────────────────────────────────── */}
        <section id="use-cases" className="py-20">
          <h2 className={`mb-12 ${H2}`}>What it&apos;s for.</h2>
          <dl className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.t} className="border-t border-[var(--color-line)] pt-5">
                <dt className="mb-3 font-serif text-lg font-medium leading-snug">{u.t}</dt>
                <dd className="text-sm leading-relaxed text-[var(--color-paper-dim)]">{u.d}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="rule" />

        {/* ── Get started ───────────────────────────────── */}
        <section className="py-20">
          <h2 className={`mb-10 ${H2}`}>Add it to your project.</h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <Code
                lang="rust"
                title="Cargo.toml"
                code={`# default: in-memory and SQLite storage
cargo add mnestic

# or, with RocksDB storage:
# mnestic = { version = "0.19", features = ["storage-rocksdb"] }`}
              />
              <Code
                lang="rust"
                title="main.rs"
                code={`use cozo::DbInstance;

let db = DbInstance::new("mem", "", "")?;
db.run_default("?[x] := x in [1, 2, 3]")?;`}
              />
              <Code
                lang="python"
                title="Python, with LangChain and LlamaIndex adapters"
                code={`pip install mnestic                          # the engine (abi3 wheels)
pip install langchain-mnestic               # LangChain vector store
pip install llama-index-vector-stores-mnestic`}
              />
            </div>
            <div className="flex flex-col justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-2)] p-8">
              <p className="label mb-4">The import name is still cozo</p>
              <p className="leading-relaxed text-[var(--color-paper-dim)]">
                The crate is published as{" "}
                <a href={CRATE} target="_blank" rel="noreferrer" className="link-grow text-[var(--color-paper)]">
                  mnestic
                </a>
                , but the library name is still{" "}
                <code className="rounded bg-[var(--color-ink)] px-1.5 py-0.5 font-mono text-sm text-[var(--color-synapse)]">
                  cozo
                </code>
                , so existing <code className="font-mono text-sm text-[var(--color-paper)]">use cozo::…</code> code
                and downstream crates compile without changes.
              </p>
            </div>
          </div>
        </section>

        <div className="rule" />

        {/* ── Attribution ───────────────────────────────── */}
        <section className="py-20">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink-2)] p-8 md:p-12">
            <p className="label mb-5">Attribution</p>
            <p className="max-w-3xl font-serif text-2xl leading-snug text-[var(--color-paper-dim)] md:text-[1.7rem]">
              mnestic is not the official CozoDB and is not affiliated with or endorsed by its authors. The original
              design is the work of <span className="text-[var(--color-paper)]">Ziyang Hu</span> and the{" "}
              <span className="text-[var(--color-paper)]">Cozo Project Authors</span>.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <a href={UPSTREAM} target="_blank" rel="noreferrer" className="label link-grow hover:text-[var(--color-paper)]">
                Original project ↗
              </a>
              <a href={`${GITHUB}/blob/main/FORK.md`} target="_blank" rel="noreferrer" className="label link-grow hover:text-[var(--color-paper)]">
                FORK.md: provenance and licensing ↗
              </a>
              <a href={`${GITHUB}/blob/main/CHANGELOG-FORK.md`} target="_blank" rel="noreferrer" className="label link-grow hover:text-[var(--color-paper)]">
                Changelog of divergences ↗
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
          Documentation adapted from the original CozoDB docs (CC-BY-SA-4.0), with original pages for the fork&apos;s
          additions. The query language is unchanged.
        </p>
      </footer>
    </>
  );
}
