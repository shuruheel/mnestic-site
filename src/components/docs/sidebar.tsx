"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { docsNav, docHref } from "@/lib/docs-nav";
import { Mark } from "@/app/logo";

export function DocsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-7">
      {docsNav.map((group) => (
        <div key={group.group}>
          <p className="label mb-3 !text-[0.64rem]">{group.group}</p>
          <ul className="flex flex-col gap-0.5">
            {group.pages.map((p) => {
              const href = docHref(p.slug);
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-[var(--color-synapse)]/10 font-medium text-[var(--color-synapse)]"
                        : "text-[var(--color-paper-dim)] hover:bg-[var(--color-ink-3)] hover:text-[var(--color-paper)]"
                    }`}
                  >
                    {p.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-[var(--color-line-bright)] px-3 py-2 font-mono text-xs text-[var(--color-paper)] lg:hidden"
        aria-expanded={open}
      >
        <Mark size={16} />
        {open ? "Close" : "Docs menu"}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="mt-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-2)] p-5 lg:hidden">
          {nav}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-60 shrink-0 overflow-y-auto pr-2 lg:block">
        {nav}
      </aside>
    </>
  );
}
