import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/app/logo";
import { DocsSidebar } from "@/components/docs/sidebar";
import { DocsPager } from "@/components/docs/pager";
import { Toc } from "@/components/docs/toc";

const GITHUB = "https://github.com/shuruheel/mnestic";

export const metadata: Metadata = {
  title: { default: "Documentation", template: "%s · mnestic docs" },
  description:
    "Documentation for mnestic — a relational-graph-vector database with Datalog, a maintained fork of CozoDB.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="field" />
      <div className="grain" />

      <header className="sticky top-0 z-50 border-b border-[var(--color-line)]/60 bg-[var(--color-ink)]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo />
            </Link>
            <span className="hidden font-mono text-xs text-[var(--color-paper-faint)] sm:inline">
              / docs
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="label link-grow hidden hover:text-[var(--color-paper)] sm:inline-block">
              Home
            </Link>
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-[var(--color-line-bright)] px-3.5 py-1.5 font-mono text-xs text-[var(--color-paper)] transition-colors hover:border-[var(--color-synapse)] hover:text-[var(--color-synapse)]"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10">
        <DocsSidebar />

        <main className="min-w-0 flex-1">
          <div className="lg:hidden">{/* mobile menu lives in sidebar */}</div>
          <article className="max-w-3xl">{children}</article>
          <div className="max-w-3xl">
            <DocsPager />
          </div>
        </main>

        <Toc />
      </div>
    </>
  );
}
