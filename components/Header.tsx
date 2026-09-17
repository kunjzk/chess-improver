import Link from "next/link";

type HeaderProps = {
  title: string;
  backHref?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function Header({
  title,
  backHref,
  actionHref,
  actionLabel,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-[#262421] px-3 py-3">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-lg text-[#e3e3e3]"
        >
          ←
        </Link>
      ) : (
        <span className="min-w-11" />
      )}
      <h1 className="flex-1 text-center text-base font-semibold tracking-wide text-[#f0f0f0]">
        {title}
      </h1>
      {actionHref ? (
        <Link
          href={actionHref}
          aria-label={actionLabel === "+" ? "Add position" : actionLabel}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-[#81b64c] px-3 text-sm font-semibold text-[#1f1f1f]"
        >
          {actionLabel ?? "+"}
        </Link>
      ) : (
        <span className="min-w-11" />
      )}
    </header>
  );
}
