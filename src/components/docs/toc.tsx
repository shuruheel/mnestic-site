"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Heading = { id: string; text: string; level: number };

/* Builds an "On this page" list from the rendered article's h2/h3 headings
   (ids added by rehype-slug) and highlights the one in view.

   Keyed on the pathname: this component lives in the docs *layout*, which the
   App Router keeps mounted across page navigations, so a one-shot effect would
   read the headings once and then show the first page's list forever. */
export function Toc() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    // Defer the DOM read out of the effect body so the state write happens
    // after paint (and satisfies react-hooks/set-state-in-effect).
    const raf = requestAnimationFrame(() => {
      const article = document.querySelector("article");
      if (!article) return;

      const nodes = Array.from(
        article.querySelectorAll("h2[id], h3[id]"),
      ) as HTMLElement[];

      setHeadings(
        nodes.map((n) => ({
          id: n.id,
          text: n.textContent ?? "",
          level: Number(n.tagName[1]),
        })),
      );
      setActive(nodes[0]?.id ?? "");

      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) setActive(e.target.id);
          }
        },
        { rootMargin: "0px 0px -75% 0px", threshold: 0 },
      );
      nodes.forEach((n) => observer!.observe(n));
    });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [pathname]);

  if (headings.length < 2) return null;

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-56 shrink-0 overflow-y-auto pl-2 xl:block">
      <p className="label mb-3 !text-[0.6rem]">On this page</p>
      <ul className="flex flex-col border-l border-[var(--color-line)]">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`-ml-px block border-l-2 py-1.5 text-[0.82rem] leading-snug transition-colors ${
                h.level === 3 ? "pl-7" : "pl-4"
              } ${
                active === h.id
                  ? "border-[var(--color-synapse)] text-[var(--color-synapse)]"
                  : "border-transparent text-[var(--color-paper-dim)] hover:border-[var(--color-line-bright)] hover:text-[var(--color-paper)]"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
