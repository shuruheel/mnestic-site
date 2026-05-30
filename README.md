# mnestic-site

Landing page for [**mnestic**](https://github.com/shuruheel/mnestic) — a
maintained fork of CozoDB, tuned as a substrate for agentic memory.

Next.js 16 (App Router) + Tailwind v4. Deploys to Vercel, mirroring the
`mindgraph-dashboard` setup. This is an **independent sibling repo** of the
`mnestic` engine repo — it is intentionally *not* nested inside the Rust crate.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
```

## Content notes

- Marketing copy emphasizes the **fork's additions** (non-blocking HNSW builds,
  one-call hybrid retrieval, equality pushdown, ULID, faster HNSW builds) over
  the inherited CozoDB capabilities.
- Code samples are checked against the real engine API
  (`HybridSearch` struct in `cozo-core/src/runtime/hybrid.rs`, crate `mnestic`,
  lib name `cozo`).
- Docs link points to the upstream CozoDB docs for now; a mnestic-specific docs
  site is planned.
- Attribution to Ziyang Hu and the Cozo Project Authors is required and must
  stay on the page (MPL-2.0).
