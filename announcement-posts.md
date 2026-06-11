# mnestic launch announcement posts

Drafts for announcing the fork. Open source emphasized; no em/en dashes.
Live site: https://mnesticdb.com · Repo: github.com/shuruheel/mnestic · v0.8.3

Positioning: mnestic is the ENGINE (relational-graph-vector, Datalog). MindGraph
is the PRODUCT built on it (structured memory for AI agents, cloud API at
mindgraph.cloud). Lead mnestic; use MindGraph as the origin story + a secondary
pitch. Do NOT call mnestic "agent memory" — that's MindGraph's line.

Honesty note: the claim is capability + recall parity + read-your-writes, NOT
raw latency. Avoid "fastest hybrid query" claims (p50 is slower than sqlite /
lancedb). Safe measured claims: \~28-29x faster single-row lookups; recall@10
0.954; 100% read-your-writes; only embedded engine fusing all 3 signals natively.
CozoDB development "stopped/went quiet" late 2024; Kuzu was formally "archived"
Oct 2025 (keep that distinction). Kuzu DNFs in our benchmark: extension host offline.

## X / Twitter

Shipping during #NYTechWeek:
 
We built MindGraph, structured memory for AI agents, on CozoDB. Then CozoDB went quiet in 2024, the kind of end that archived Kuzu this year.

So we resurrected it. mnestic is a maintained fork of CozoDB: an embedded graph + vector engine queried in Datalog, with native one-call hybrid retrieval (vector + keyword + graph) and \~28x faster lookups.

Open source, MPL-2.0. mnesticdb.com #NYTechWeek

## LinkedIn

**mnestic: we resurrected CozoDB for the age of agentic memory**

Shipping during #NYTechWeek.

We built MindGraph, structured memory for AI agents: a patent-pending cognitive knowledge graph that ingests documents, extracts a six-layer ontology, and answers over hybrid graph-and-text retrieval.

We built it on CozoDB, a brilliant embedded relational-graph-vector database queried in Datalog. Then CozoDB's active development stopped in late 2024. The engine we depended on went quiet, around the same time that KuzuDB was archived.

Rather than migrate off, we resurrected it. mnestic is a maintained fork of CozoDB, and we used everything we learned building MindGraph to close the gaps we kept hitting:

- Native one-call hybrid retrieval: vector + full-text (BM25) + graph proximity fused inside a single transaction. 0.954 recall@10 in our public benchmark, as the only embedded engine fusing all three natively, with 100% read-your-writes (write a memory, recall it on the very next query).
- Roughly 28x faster single-row lookups (equality pushdown to keyed prefix joins).
- Non-blocking HNSW index builds, about 3x faster, so an agent writing memory continuously is never blocked by a rebuild.
- BM25-correct full-text and ULID keys for append-only memory streams.

mnestic is free and open under MPL-2.0. No closed core, no lock-in. And MindGraph, the cognitive memory layer we built on top, is live with a cloud API.

Credit for the original design goes to Ziyang Hu and the Cozo Project Authors.

mnesticdb.com (engine) · mindgraph.cloud (memory layer) · github.com/shuruheel/mnestic

## Notes on tech-week framing

NY Tech Week is June 1-7, 2026 (decentralized, presented by a16z). #NYTechWeek
is the common hashtag; @techweeka16z is the official account.
