import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { Attribution, Callout } from "@/components/docs/blocks";

type A = ComponentPropsWithoutRef<"a">;

/* Maps markdown/MDX elements onto the mnestic design system, and exposes the
   custom doc components (Callout, Attribution) for use inside .mdx files. */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (p) => (
      <h1 className="mb-5 font-serif text-[2.6rem] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--color-paper)]" {...p} />
    ),
    h2: (p) => (
      <h2 className="mt-14 mb-4 scroll-mt-24 border-t border-[var(--color-line)] pt-8 font-serif text-[1.85rem] font-medium tracking-tight text-[var(--color-paper)]" {...p} />
    ),
    h3: (p) => (
      <h3 className="mt-9 mb-3 scroll-mt-24 font-serif text-[1.35rem] font-medium text-[var(--color-paper)]" {...p} />
    ),
    h4: (p) => (
      <h4 className="mt-7 mb-2 scroll-mt-24 font-sans text-base font-semibold tracking-wide text-[var(--color-paper)]" {...p} />
    ),
    p: (p) => (
      <p className="my-4 leading-[1.75] text-[var(--color-paper-dim)]" {...p} />
    ),
    a: ({ href = "", ...rest }: A) => {
      const internal = href.startsWith("/") || href.startsWith("#");
      const cls =
        "font-medium text-[var(--color-synapse)] underline decoration-[var(--color-synapse)]/30 underline-offset-2 transition-colors hover:decoration-[var(--color-synapse)]";
      if (internal) {
        return <Link href={href} className={cls} {...rest} />;
      }
      return <a href={href} target="_blank" rel="noreferrer" className={cls} {...rest} />;
    },
    ul: (p) => (
      <ul className="my-4 ml-1 flex list-none flex-col gap-2 text-[var(--color-paper-dim)] [&_ul]:mt-2 [&_ul]:ml-5" {...p} />
    ),
    ol: (p) => (
      <ol className="my-4 ml-5 flex list-decimal flex-col gap-2 text-[var(--color-paper-dim)] marker:text-[var(--color-paper-faint)]" {...p} />
    ),
    li: ({ children, ...p }) => (
      <li
        className="relative pl-5 leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:h-1 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-[var(--color-synapse)]/70 [li>ol_&]:pl-0 [li>ol_&]:before:hidden [ol_&]:pl-1 [ol_&]:before:hidden"
        {...p}
      >
        {children}
      </li>
    ),
    blockquote: (p) => (
      <blockquote className="my-6 border-l-2 border-[var(--color-line-bright)] py-1 pl-5 italic text-[var(--color-paper-faint)]" {...p} />
    ),
    strong: (p) => <strong className="font-semibold text-[var(--color-paper)]" {...p} />,
    hr: () => <hr className="my-10 border-0 border-t border-[var(--color-line)]" />,
    // Inline code (fenced blocks are pre > code, styled below and skip this).
    code: (p) => {
      const isBlock =
        typeof p.className === "string" || "data-language" in p;
      if (isBlock) return <code {...p} />;
      return (
        <code
          className="rounded border border-[var(--color-line)] bg-[var(--color-ink-2)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--color-synapse)]"
          {...p}
        />
      );
    },
    pre: (p) => (
      <pre
        className="my-6 overflow-x-auto rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-2)] p-5 font-mono text-[0.82rem] leading-relaxed [&_code]:bg-transparent [&_code]:p-0 [&_.line]:block"
        {...p}
      />
    ),
    table: (p) => (
      <div className="my-6 overflow-x-auto rounded-lg border border-[var(--color-line)]">
        <table className="w-full border-collapse text-sm" {...p} />
      </div>
    ),
    thead: (p) => <thead className="bg-[var(--color-ink-2)]" {...p} />,
    th: (p) => (
      <th className="border-b border-[var(--color-line)] px-4 py-2.5 text-left font-mono text-[0.7rem] uppercase tracking-wider text-[var(--color-paper-faint)]" {...p} />
    ),
    td: (p) => (
      <td className="border-b border-[var(--color-line)]/60 px-4 py-2.5 align-top text-[var(--color-paper-dim)]" {...p} />
    ),
    Callout,
    Attribution,
    ...components,
  };
}
