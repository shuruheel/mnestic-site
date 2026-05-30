"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { adjacentDocs, docHref } from "@/lib/docs-nav";

/* Prev/next links derived from the current path's position in the doc tree. */
export function DocsPager() {
  const pathname = usePathname();
  const slug = pathname === "/docs" ? "" : pathname.replace(/^\/docs\//, "");
  const { prev, next } = adjacentDocs(slug);

  if (!prev && !next) return null;

  return (
    <nav className="mt-16 grid grid-cols-1 gap-4 border-t border-[var(--color-line)] pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={docHref(prev.slug)}
          className="group rounded-lg border border-[var(--color-line)] p-4 transition-colors hover:border-[var(--color-line-bright)]"
        >
          <span className="label !text-[0.6rem]">← Previous</span>
          <span className="mt-1 block font-serif text-lg text-[var(--color-paper)] group-hover:text-[var(--color-synapse)]">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={docHref(next.slug)}
          className="group rounded-lg border border-[var(--color-line)] p-4 text-right transition-colors hover:border-[var(--color-line-bright)] sm:col-start-2"
        >
          <span className="label !text-[0.6rem]">Next →</span>
          <span className="mt-1 block font-serif text-lg text-[var(--color-paper)] group-hover:text-[var(--color-synapse)]">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
