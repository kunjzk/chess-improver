"use client";

import { defaultPieces } from "react-chessboard";
import { capturedPieces, type CapturedPiece } from "@/lib/chess";
import type { PlayerColor } from "@/lib/types";

const PIECE_NAME: Record<CapturedPiece["type"], string> = {
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

function CapturedIcon({ piece }: { piece: CapturedPiece }) {
  const key = `${piece.color}${piece.type.toUpperCase()}`;
  const render = defaultPieces[key];
  if (!render) {
    return null;
  }

  const label = `${piece.color === "w" ? "White" : "Black"} ${PIECE_NAME[piece.type]}`;

  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center ${
        piece.color === "b" ? "drop-shadow-[0_0_0.7px_#d4d4d4]" : ""
      }`}
      title={label}
      aria-label={label}
    >
      {render()}
    </span>
  );
}

function PieceRow({
  label,
  pieces,
}: {
  label: string;
  pieces: CapturedPiece[];
}) {
  return (
    <p className="flex min-h-6 items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-[#9c9c9c]">{label}</span>
      {pieces.length > 0 ? (
        <span className="flex flex-wrap items-center">
          {pieces.map((piece, index) => (
            <CapturedIcon key={`${piece.color}-${piece.type}-${index}`} piece={piece} />
          ))}
        </span>
      ) : (
        <span className="text-sm text-[#6d6d6d]">—</span>
      )}
    </p>
  );
}

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
      <PieceRow label="You took" pieces={mine} />
      <PieceRow label="They took" pieces={theirs} />
    </div>
  );
}
