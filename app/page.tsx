import Link from "next/link";
import { Header } from "@/components/Header";
import { parsePgn, plyLabel } from "@/lib/chess";
import { loadPositions } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const positions = await loadPositions();

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
          <ul className="flex flex-col gap-3">
            {positions.map((position) => {
              let label = `Ply ${position.ply}`;
              try {
                label = plyLabel(parsePgn(position.pgn), position.ply);
              } catch {
                label = "Could not read PGN";
              }
              const vs = [position.white, position.black]
                .filter(Boolean)
                .join(" vs ");

              return (
                <li key={position.id}>
                  <Link
                    href={`/positions/${position.id}`}
                    className="block rounded-xl bg-[#262421] px-4 py-4"
                  >
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
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
