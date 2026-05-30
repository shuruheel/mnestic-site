import type { ReactNode } from "react";

/* CC-BY-SA attribution banner. Placed at the foot of every page adapted from
   the original CozoDB documentation, per the ShareAlike license terms. */
export function Attribution({
  source,
  page,
}: {
  source?: string;
  page?: string;
}) {
  const href =
    source ??
    (page
      ? `https://docs.cozodb.org/en/latest/${page}`
      : "https://docs.cozodb.org/en/latest/");
  return (
    <div className="mt-14 rounded-lg border border-[var(--color-line)] bg-[var(--color-ink-2)] p-5 text-sm leading-relaxed text-[var(--color-paper-faint)]">
      <p>
        Adapted from the{" "}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--color-slate)] underline underline-offset-2"
        >
          CozoDB documentation
        </a>{" "}
        by Ziyang Hu and the Cozo Project Authors, used under{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--color-slate)] underline underline-offset-2"
        >
          CC&#8209;BY&#8209;SA&#8209;4.0
        </a>
        . Adaptations for mnestic are released under the same license. mnestic is
        an independent fork and is not affiliated with or endorsed by the
        original authors.
      </p>
    </div>
  );
}

type CalloutKind = "note" | "warning" | "fork";

const styles: Record<CalloutKind, { bar: string; tag: string; label: string }> =
  {
    note: {
      bar: "border-[var(--color-slate)]",
      tag: "text-[var(--color-slate)]",
      label: "Note",
    },
    warning: {
      bar: "border-[var(--color-amber)]",
      tag: "text-[var(--color-amber)]",
      label: "Caution",
    },
    fork: {
      bar: "border-[var(--color-synapse)]",
      tag: "text-[var(--color-synapse)]",
      label: "mnestic",
    },
  };

/* A callout box. `fork` flags behavior specific to this fork. */
export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: CalloutKind;
  title?: string;
  children: ReactNode;
}) {
  const s = styles[type];
  return (
    <div
      className={`my-6 rounded-r-lg border-l-2 ${s.bar} bg-[var(--color-ink-2)] py-4 pl-5 pr-5`}
    >
      <p className={`label mb-1.5 !text-[0.62rem] ${s.tag}`}>
        {title ?? s.label}
      </p>
      <div className="text-[0.92rem] leading-relaxed text-[var(--color-paper-dim)] [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}
