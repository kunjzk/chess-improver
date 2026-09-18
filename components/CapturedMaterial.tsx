import { capturedPieces } from "@/lib/chess";
import type { PlayerColor } from "@/lib/types";

export function CapturedMaterial({
  fen,
  myColor,
}: {
  fen: string;
  myColor: PlayerColor;
}) {
  const captured = capturedPieces(fen);
  const mine = captured[myColor === "w" ? "b" : "w"];
  const theirs = captured[myColor];

  return (
    <div className="mt-2 flex flex-col gap-1 text-sm">
      <p className="flex min-h-6 items-center gap-2">
        <span className="w-16 shrink-0 text-xs text-[#9c9c9c]">You took</span>
        <span className="tracking-wide text-lg leading-none">
          {mine.join("") || "—"}
        </span>
      </p>
      <p className="flex min-h-6 items-center gap-2">
        <span className="w-16 shrink-0 text-xs text-[#9c9c9c]">They took</span>
        <span className="tracking-wide text-lg leading-none">
          {theirs.join("") || "—"}
        </span>
      </p>
    </div>
  );
}
