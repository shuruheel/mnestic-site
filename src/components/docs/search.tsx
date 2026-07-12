"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { docHref } from "@/lib/docs-nav";
import {
  type Entry,
  type Hit,
  type SearchIndex,
  escapeRe,
  prepare,
  search,
  snippet,
  termsOf,
} from "@/lib/docs-search";

/* The docs search dialog.

   The index is a build artifact (scripts/build-search-index.mjs) split at each
   h2/h3, so a hit lands on the heading that answers the query. It is fetched
   lazily the first time the reader reaches for search — nobody pays for it just
   by reading a page — and searched in memory: a few hundred sections is far too
   small to justify a server round trip per keystroke. The ranking lives in
   lib/docs-search.ts, where it can be tested without a DOM; this file is the UI
   around it. */

const SUGGESTIONS = ["min_cost_k", ":as_of", "HNSW", "recursion", "::explain"];

let cache: Promise<Entry[]> | null = null;

function loadIndex(): Promise<Entry[]> {
  cache ??= fetch("/search-index.json")
    .then((r) => {
      if (!r.ok) throw new Error("search index: HTTP " + r.status);
      return r.json() as Promise<SearchIndex>;
    })
    .then(prepare)
    .catch((e) => {
      cache = null; // let a later open retry
      throw e;
    });
  return cache;
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const parts = text.split(
    new RegExp(`(${terms.map(escapeRe).join("|")})`, "gi"),
  );
  const wanted = new Set(terms);

  return (
    <>
      {parts.map((part, i) =>
        wanted.has(part.toLowerCase()) ? (
          <mark
            key={i}
            className="bg-transparent font-medium text-[var(--color-synapse)]"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/* ── Component ────────────────────────────────────────────────────────────── */

/** The ⌘ vs Ctrl hint is a client-only fact. Reading it through an external
    store keeps the server render ("Ctrl") and the first client render honest,
    with no post-mount setState to cascade a re-render. */
const subscribeNever = () => () => {};
const useIsMac = () =>
  useSyncExternalStore(
    subscribeNever,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent),
    () => false,
  );

export function DocsSearch() {
  const router = useRouter();
  const listboxId = useId();
  const isMac = useIsMac();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);
  // Keyed on the query so a new query resets the highlight to the first row by
  // derivation, rather than by a setState that lands a render too late.
  const [cursor, setCursor] = useState({ query: "", row: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const fetchIndex = useCallback(() => {
    if (entries || failed) return;
    loadIndex().then(setEntries, () => setFailed(true));
  }, [entries, failed]);

  const groups = useMemo(
    () => (entries ? search(entries, query) : []),
    [entries, query],
  );

  /* Number every row up front: the rows are grouped by page for display but
     traversed as one flat list by the keyboard. */
  const rows = useMemo(() => {
    let n = 0;
    return groups.map((group) => ({
      page: group.page,
      hits: group.hits.map((hit) => ({ hit, row: n++ })),
    }));
  }, [groups]);

  const flat = useMemo(() => rows.flatMap((g) => g.hits.map((h) => h.hit)), [rows]);
  const terms = useMemo(() => termsOf(query), [query]);

  const active = cursor.query === query ? cursor.row : 0;
  const setActive = useCallback(
    (row: number) => setCursor({ query, row }),
    [query],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }, []);

  const go = useCallback(
    (hit: Hit) => {
      const { page, anchor } = hit.entry;
      close();
      router.push(docHref(page.s) + (anchor ? `#${anchor}` : ""));
    },
    [close, router],
  );

  /* Open on ⌘K / Ctrl-K, or "/" when the reader is not already typing. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable === true;

      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        fetchIndex();
      } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
        fetchIndex();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fetchIndex]);

  /* Lock the page behind the dialog and focus the field. */
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  /* Keep the highlighted row in view as it moves. */
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" && flat.length > 0) {
      e.preventDefault();
      setActive((active + 1) % flat.length);
    } else if (e.key === "ArrowUp" && flat.length > 0) {
      e.preventDefault();
      setActive((active - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active]);
    }
  };

  const optionId = (i: number) => `${listboxId}-option-${i}`;

  const dialog = (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[var(--color-ink)]/80 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        className="mt-[8vh] flex max-h-[76vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--color-line-bright)] bg-[var(--color-ink-2)] shadow-2xl"
        onKeyDown={onKeyDown}
      >
        {/* Field */}
        <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4">
          <SearchIcon className="h-4 w-4 shrink-0 text-[var(--color-paper-faint)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the documentation…"
            aria-label="Search documentation"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={flat[active] ? optionId(active) : undefined}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            className="w-full bg-transparent py-4 text-[0.95rem] text-[var(--color-paper)] outline-none placeholder:text-[var(--color-paper-faint)]"
          />
          <kbd className="shrink-0 rounded border border-[var(--color-line-bright)] px-1.5 py-0.5 font-mono text-[0.65rem] text-[var(--color-paper-faint)]">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="sr-only" aria-live="polite">
            {query && `${flat.length} results`}
          </div>

          {failed ? (
            <p className="px-5 py-10 text-center text-sm text-[var(--color-paper-faint)]">
              The search index could not be loaded. Reload the page to try again.
            </p>
          ) : !query ? (
            <div className="px-5 py-8">
              <p className="label mb-3 !text-[0.6rem]">Try</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                      inputRef.current?.focus();
                    }}
                    className="rounded-md border border-[var(--color-line)] bg-[var(--color-ink-3)] px-2.5 py-1 font-mono text-xs text-[var(--color-paper-dim)] transition-colors hover:border-[var(--color-synapse)] hover:text-[var(--color-synapse)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : !entries ? (
            <p className="px-5 py-10 text-center text-sm text-[var(--color-paper-faint)]">
              Loading the index…
            </p>
          ) : flat.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[var(--color-paper-faint)]">
              No matches for{" "}
              <span className="font-mono text-[var(--color-paper-dim)]">
                {query}
              </span>
              .
            </p>
          ) : (
            <ul role="listbox" id={listboxId} aria-label="Search results" className="py-2">
              {rows.map((group) => (
                <li key={group.page.s || "index"}>
                  <p className="label px-5 pt-3 pb-1.5 !text-[0.58rem] !text-[var(--color-paper-dim)]">
                    {group.page.t}
                  </p>
                  <ul>
                    {group.hits.map(({ hit, row }) => {
                      const selected = row === active;
                      return (
                        <li key={`${group.page.s}-${hit.entry.anchor ?? ""}`}>
                          <button
                            id={optionId(row)}
                            role="option"
                            aria-selected={selected}
                            data-active={selected}
                            onClick={() => go(hit)}
                            onMouseMove={() => setActive(row)}
                            className={`block w-full border-l-2 px-5 py-2.5 text-left transition-colors ${
                              selected
                                ? "border-[var(--color-synapse)] bg-[var(--color-ink-3)]"
                                : "border-transparent"
                            }`}
                          >
                            <span className="block text-[0.9rem] leading-snug font-medium text-[var(--color-paper)]">
                              <Highlight
                                text={hit.entry.heading ?? group.page.t}
                                terms={terms}
                              />
                            </span>
                            {hit.entry.text && (
                              <span className="mt-1 block text-[0.78rem] leading-relaxed text-[var(--color-paper-faint)]">
                                <Highlight
                                  text={snippet(hit.entry, terms)}
                                  terms={terms}
                                />
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Hints */}
        <div className="flex items-center gap-4 border-t border-[var(--color-line)] px-5 py-2.5 font-mono text-[0.62rem] text-[var(--color-paper-faint)]">
          <span>
            <Key>↑</Key>
            <Key>↓</Key> navigate
          </span>
          <span>
            <Key>↵</Key> open
          </span>
          <span className="ml-auto hidden sm:inline">
            search runs in your browser
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => {
          setOpen(true);
          fetchIndex();
        }}
        onPointerEnter={fetchIndex}
        onFocus={fetchIndex}
        aria-label="Search documentation"
        className="flex items-center gap-2 rounded-md border border-[var(--color-line-bright)] px-3 py-1.5 font-mono text-xs text-[var(--color-paper-dim)] transition-colors hover:border-[var(--color-synapse)] hover:text-[var(--color-synapse)]"
      >
        <SearchIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-[var(--color-line)] px-1 py-px text-[0.6rem] text-[var(--color-paper-faint)] md:inline">
          {isMac ? "⌘" : "Ctrl "}K
        </kbd>
      </button>

      {/* `open` is only ever true after a client interaction, so document is
          guaranteed here and the server never reaches the portal. */}
      {open && createPortal(dialog, document.body)}
    </>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mr-1 inline-block rounded border border-[var(--color-line-bright)] px-1 py-px text-[var(--color-paper-dim)]">
      {children}
    </kbd>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}
