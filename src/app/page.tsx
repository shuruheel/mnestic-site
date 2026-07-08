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

const BITEMP_CODE = `# opt in: valid time + an engine-stamped transaction time
:create beliefs {claim, vld: Validity, tt: TxTime => conf: Float}

# writes are stamped by a crash-safe commit clock — tt is never user-set
?[c, v, conf] <- [['q3 pipeline is healthy', '2026-09-01', 0.35]]
:put beliefs {c, v => conf}

# time travel on BOTH axes:
# what did we believe on June 30 about September?
?[conf] := *beliefs{claim: 'q3 pipeline is healthy', conf
                    @ (vt: '2026-09-01', tt: '2026-06-30')}

# the audit trail: every belief, correction, and cessation
::history beliefs [['q3 pipeline is healthy']]`;

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
    t: "Bitemporal time travel",
    d: "Relations carry valid time and, since 0.10.0, an engine-stamped transaction time. Query the graph as it was — and as it was believed — at any point: memory you can rewind and audit, not just overwrite.",
  },
];

const forkItems = [
  {
    ver: "0.10.7",
    t: "A join-reorder plan fix, and factorization from Python",
    d: "Two targeted patches. The default greedy join reorder no longer demotes a full-composite-key filter to a partial-key expansion — a tie-break bug (full_key_lookup_bonus) that could pull a high-fan-out edge ahead of a more selective atom and regress a cyclic-join query (a benchmarker measured LDBC-SNB LSQB Q3 go from ~19s to a timeout; the fix restores it). No query-result change, and the min-new-vars speed-up is preserved. Separately, the Python binding now exposes db.set_query_factorization(True) / db.query_factorization(), so the 0.10.5 factorized-count() kill switch — previously Rust-only — is toggleable from Python. Default stays off.",
    metric: "LDBC-SNB LSQB Q3 restored · no query-result change · Python factorization toggle · default off",
  },
  {
    ver: "0.10.6",
    t: "Legacy databases open again after upgrade",
    d: "An urgent upgrade-safety patch. On 0.10.0–0.10.5 a database created before 0.10.0 could fail to open after upgrading — \"Cannot deserialize relation metadata from bytes\" — because the bitemporality work added a struct field mid-record, which broke positional decoding of legacy relation catalogs and could take the whole database down. 0.10.6 makes catalog decoding tolerant of the legacy layout and switches every catalog write to a self-describing, field-named encoding so it can't recur. No migration: legacy databases open as-is and re-canonicalize on their next write. Anyone who upgraded a pre-0.10.0 database to any 0.10.0–0.10.5 should upgrade.",
    metric: "legacy catalogs open as-is · self-describing catalog writes · no migration · no query-behavior change",
  },
  {
    ver: "0.10.5",
    t: "Queries you can always stop",
    d: "::kill and :timeout now interrupt a query that is genuinely stuck. ::kill dispatches before any storage transaction opens, so on the mem/sqlite backends it no longer queues behind the very query it is trying to kill; and the per-query poison flag is now checked every 4096 pulls inside the relational-algebra enumeration, so even a long single-rule join that emits nothing is finally interruptible. A per-query wall-clock budget rides the same cadence — set it in-script with :timeout, per call, or as a Db-wide default; the effective deadline is the minimum of whichever are set, and expiry raises a distinct eval::timeout (a kill raises eval::killed).",
    metric: "::kill / :timeout interrupt mid-join · deadline = min of the budgets set · no wall-clock budget on wasm",
  },
  {
    ver: "0.10.5",
    t: "Naive join order stops being pathological",
    d: "No pass used to consider join order, so a naively-ordered conjunction — exactly the shape an LLM agent authors — could spin on an N³ intermediate. A stat-free, deterministic greedy pre-pass now reorders the positive relation atoms of an eligible conjunction by fewest new variables, collapsing that blow-up. Results are unchanged: the pass is the identity on any already-greedy-consistent order, so hand-tuned plans stay byte-identical, and it is default on (opt out per query with :reorder written). It is not a cost-based optimizer — there are no cardinality stats — and a genuinely disconnected Cartesian step is warned and annotated in ::explain.",
    metric: "54.5× on the repro · N³ → N² · default on, :reorder written opts out · results unchanged",
  },
  {
    ver: "0.10.5",
    t: "Counting without materializing the join",
    d: "count() over a join streams every match. An opt-in normal-form rewrite instead turns an eligible single-clause count()-over-positive-join into per-key counting sub-rules — a bit-identical, exact-i64 answer computed without enumerating the join at all. It fires only on shapes it can prove exact (a body with any != predicate declines to plain naive evaluation), stays default off this release behind set_query_factorization to soak, and an always-on detector still surfaces a factorization advisory in ::explain.",
    metric: "4–342× vs a factorizing optimizer · opt-in, default off · bit-identical exact-i64 count",
  },
  {
    ver: "0.10.5",
    t: "RocksDB, straight from pip",
    d: "CozoDbPy(\"rocksdb\", path) now works from a plain pip install mnestic — the wheel was compact/SQLite-only before, so the highest-throughput backend was unreachable without building from source. Wheels now ship the storage-rocksdb backend on all five platform legs; the sdist stays compact, so persistence is wheel-only. (Relatedly: a bulk import_relations into an HNSW/FTS/LSH-indexed relation now warns — the bulk path does not maintain those indexes.)",
    metric: "pip install mnestic ships the rocksdb backend · wheel-only persist · sdist stays compact",
  },
  {
    ver: "0.10.1",
    t: "Pareto frontiers and intervals, in-engine",
    d: "register_bounded_meet_aggr opens the bounded-meet category to a host-registered strict partial order: per group, the aggregate keeps only the non-dominated operands — the antichain, the skyline, the Pareto frontier — each survivor its own output row, riding the same stratifier permit and divergence cap as min_cost_k. Alongside it, two interval primitives over half-open [start, end) spans: the interval_overlaps predicate and the interval_coalesce aggregate (touching spans coalesce; empty spans overlap nothing). Plus a bit_and / bit_or changed-bit correctness fix.",
    metric: "register_bounded_meet_aggr · non-dominated set per group · interval_overlaps / interval_coalesce · Rust-embedded v1",
  },
  {
    ver: "0.10.0",
    t: "Bitemporality: an audit trail for belief",
    d: "Every relation can opt into an engine-stamped transaction-time axis alongside valid time. Corrections append instead of overwrite, reads default to the current belief, and time travel answers what the database believed at any past moment — with ::history for the raw timeline, garbage collection that never fakes history, and audited eviction for data-erasure obligations.",
    metric: "current-belief reads within ~4–12% of single-axis · nothing comparable in-engine in an embedded database",
  },
  {
    ver: "0.10.0",
    t: "Answers that carry their evidence",
    d: "Provenance-semiring aggregates: register a custom combine for recursive rules, or ask for the k best derivations per answer — each with the exact evidence chain that justifies it. :reconcile keeps derived results consistent when base facts are retracted, recording the whole revision as one auditable belief event.",
    metric: "min_cost_k top-k proofs · register_custom_aggr · :reconcile belief revision",
  },
  {
    ver: "0.9.0",
    t: "Cypher reads (alpha)",
    d: "A read-only openCypher subset translates to CozoScript over your stored relations — evaluate the engine without learning Datalog first. MATCH / WHERE / RETURN with aggregates, ORDER BY, SKIP and LIMIT; Datalog stays the native, full-power language.",
    metric: "opt-in cypher feature · run_cypher / cypher_to_script",
  },
  {
    ver: "0.8.6",
    t: "Repair corruption without losing data",
    d: "A few truncated tuples used to put a whole relation in doubt. ::repair_corrupt now surgically removes only the damaged rows by their intact keys and leaves everything else in place — recovery instead of a rebuild, and never a wholesale delete of your data.",
    metric: "deletes only short-arity tuples · the rest of your data stays put",
  },
  {
    ver: "0.8.1–0.8.4",
    t: "Three-way recall in one call",
    d: "Vector similarity, keyword match, and graph proximity — the three signals behind “what should I recall right now” — fuse in a single typed call, ranked by Reciprocal Rank Fusion and diversified with MMR. It used to take about seven hand-written Datalog rules, and every result can now tell you which signals surfaced it.",
    metric: "all three signals, one transaction · ~4× faster than stitching it by hand",
  },
  {
    ver: "0.8.1–0.8.5",
    t: "Index builds that never block reads",
    d: "Building a vector (HNSW) or full-text index used to lock the table and stall every reader until it finished. Now the build happens off to the side while reads keep flowing the whole time — and the build itself is up to 15× faster.",
    metric: "40k vectors indexed in ~19 s · 90k reads served mid-build",
  },
  {
    ver: "0.8.3",
    t: "Full-text search that ranks correctly",
    d: "Keyword search now scores with Okapi BM25 — the ranking standard behind modern search engines — instead of raw term counts. The keyword half of hybrid recall actually surfaces the right passages.",
    metric: "fused recall climbs 0.75 → 0.954 on a 40k-chunk corpus",
  },
  {
    ver: "0.8.5",
    t: "Reads that don’t wait on writers",
    d: "Read-only queries now read through a plain snapshot instead of opening a transaction, so a busy writer can never block a reader. For an agent recalling while it ingests, that means steady, predictable latency.",
    metric: "keyed point reads −16% p50, −19% p99",
  },
  {
    ver: "0.8.0",
    t: "Key lookups skip the full scan",
    d: "Filtering a stored relation by an exact key now compiles to a direct keyed seek instead of scanning every row — the difference between a constant-time lookup and a full table walk on your hottest queries.",
    metric: "~28× faster single-row primary-key lookups",
  },
  {
    ver: "0.8.0",
    t: "Time-ordered IDs for memory streams",
    d: "rand_ulid() generates sortable, time-ordered identifiers — ideal for append-only memory you scan by recency, with the creation time recoverable straight from the key.",
    metric: "lexicographically sortable · time-ordered scans",
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
            <a href="#perf" className="label link-grow hidden md:inline-block hover:text-[var(--color-paper)]">
              Speed
            </a>
            <a href="#fork" className="label link-grow hidden md:inline-block hover:text-[var(--color-paper)]">
              The Fork
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
                a maintained fork of CozoDB · v0.10.7
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
            vertices ≈ 30 s. mnestic keeps these and adds the recall-focused
            wins below.
          </p>
        </section>

        <div className="rule" />

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

        {/* ── Marquee feature: bitemporality ────────────── */}
        <section className="grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="label">The headline feature · 0.10.0</span>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-tight tracking-tight md:text-[2.9rem]">
              What did we believe
              <br />
              <span className="italic text-[var(--color-synapse)]">
                at time T
              </span>{" "}
              about period Y?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-paper-dim)]">
              Valid time says when a fact is true in the world. Transaction time
              says when the database <em>learned</em> it — and 0.10.0 adds it
              in-engine, stamped at commit by a crash-safe monotonic clock.
              Reproduce last Tuesday&apos;s answer exactly. Audit every
              correction. Tell &ldquo;the world changed&rdquo; apart from
              &ldquo;we were wrong.&rdquo; No other embedded engine serves this
              natively.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "tt is engine-assigned, never user-set — nobody can backdate what the system knew",
                "::history / ::history_gc / ::evict manage the record's lifecycle; GC keeps as-of reads exact behind a persisted floor",
                "Current-belief reads measured within ~4–12% of a single-axis relation; opt-in, zero cost if unused",
              ].map((li) => (
                <li key={li} className="flex gap-3 text-sm text-[var(--color-paper-dim)]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-synapse)]" />
                  {li}
                </li>
              ))}
            </ul>
          </div>
          <Code code={BITEMP_CODE} lang="cozo" title="bitemporality — belief, versioned" />
        </section>

        <div className="rule" />

        {/* ── Marquee feature: hybrid_search ────────────── */}
        <section className="grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="label">Native hybrid retrieval</span>
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
              0.10.0 changelog
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
            Add it to your project
          </h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <Code
                lang="rust"
                title="Cargo.toml — the importable name stays cozo"
                code={`# default = in-memory + SQLite backends
cargo add mnestic

# or, with the RocksDB backend:
# mnestic = { version = "0.10", features = ["storage-rocksdb"] }`}
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
                title="Python — with LangChain & LlamaIndex adapters"
                code={`pip install mnestic                          # the engine (abi3 wheels)
pip install langchain-mnestic               # LangChain vector store
pip install llama-index-vector-stores-mnestic`}
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
