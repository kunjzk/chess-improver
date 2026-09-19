import Link from "next/link";
import { Header } from "@/components/Header";
import { StarButton } from "@/components/StarButton";
import { parsePgn, plyLabel } from "@/lib/chess";
import { loadPositions } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const starredOnly = filter === "starred";
  const positions = await loadPositions();
  const visible = starredOnly
    ? positions.filter((position) => position.starred)
    : positions;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
      <Header title="Positions" actionHref="/new" actionLabel="+" />
      <main className="flex-1 px-3 py-4">
        {positions.length === 0 ? (
          <div className="rounded-xl bg-[#262421] px-4 py-10 text-center">
            <p className="text-[#c0c0c0]">No positions yet.</p>
            <Link
              href="/new"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#81b64c] px-4 py-2 text-sm font-semibold text-[#1f1f1f]"
            >
              Add a position
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <Link
                href="/"
                className={`flex h-11 items-center justify-center rounded-lg text-sm font-semibold ${
                  starredOnly
                    ? "bg-[#3d3a37] text-[#f0f0f0]"
                    : "bg-[#81b64c] text-[#1f1f1f]"
                }`}
              >
                All
              </Link>
              <Link
                href="/?filter=starred"
                className={`flex h-11 items-center justify-center rounded-lg text-sm font-semibold ${
                  starredOnly
                    ? "bg-[#81b64c] text-[#1f1f1f]"
                    : "bg-[#3d3a37] text-[#f0f0f0]"
                }`}
              >
                Starred
              </Link>
            </div>
            {visible.length === 0 ? (
              <div className="rounded-xl bg-[#262421] px-4 py-10 text-center">
                <p className="text-[#c0c0c0]">No starred positions yet.</p>
                <p className="mt-2 text-sm text-[#9c9c9c]">
                  Star one from a review card to see it here.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {visible.map((position) => {
                  let label = `Ply ${position.ply}`;
                  try {
                    label = plyLabel(parsePgn(position.pgn), position.ply);
                  } catch {
                    label = "Could not read PGN";
                  }
                  const vs = [position.white, position.black]
                    .filter(Boolean)
                    .join(" vs ");
                  const href = starredOnly
                    ? `/positions/${position.id}?filter=starred`
                    : `/positions/${position.id}`;

                  return (
                    <li
                      key={position.id}
                      className="flex items-stretch overflow-hidden rounded-xl bg-[#262421]"
                    >
                      <Link href={href} className="min-w-0 flex-1 px-4 py-4">
                        <p className="text-sm font-semibold text-white">
                          {vs || "Untitled game"}
                        </p>
                        <p className="mt-1 text-sm text-[#c8c8c8]">{label}</p>
                        <p className="mt-2 text-xs text-[#9c9c9c]">
                          {position.questions.length} question
                          {position.questions.length === 1 ? "" : "s"} · you are{" "}
                          {position.myColor === "w" ? "White" : "Black"}
                        </p>
                      </Link>
                      <div className="flex items-center border-l border-white/5 px-1">
                        <StarButton
                          positionId={position.id}
                          starred={position.starred}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
