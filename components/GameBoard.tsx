"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  isLightSquare,
  legalTargets,
  pieceColorOnSquare,
  tryMove,
  turnFromFen,
} from "@/lib/chess";
import type { LastMove, PlayerColor } from "@/lib/types";

const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square w-full bg-[#739552]" />
    ),
  },
);

const LAST_MOVE_LIGHT = "#cdd26a";
const LAST_MOVE_DARK = "#aaa23a";

type GameBoardProps = {
  fen: string;
  orientation: PlayerColor;
  lastMove: LastMove | null;
  allowMoves?: boolean;
  onMove?: (nextFen: string, lastMove: LastMove) => void;
};

export function GameBoard({
  fen,
  orientation,
  lastMove,
  allowMoves = false,
  onMove,
}: GameBoardProps) {
  const [selection, setSelection] = useState<{
    fen: string;
    square: string;
  } | null>(null);
  const selected = selection?.fen === fen ? selection.square : null;

  const targets = useMemo(
    () => (selected ? legalTargets(fen, selected) : []),
    [fen, selected],
  );

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {};
    if (lastMove) {
      for (const square of [lastMove.from, lastMove.to]) {
        styles[square] = {
          backgroundColor: isLightSquare(square)
            ? LAST_MOVE_LIGHT
            : LAST_MOVE_DARK,
        };
      }
    }
    if (selected) {
      styles[selected] = {
        ...(styles[selected] ?? {}),
        boxShadow: "inset 0 0 0 3px #ebc334",
      };
    }
    for (const square of targets) {
      const occupied = pieceColorOnSquare(fen, square) !== null;
      styles[square] = {
        ...(styles[square] ?? {}),
        backgroundImage: occupied
          ? "radial-gradient(transparent 0 58%, rgba(0,0,0,0.22) 59% 100%)"
          : "radial-gradient(circle, rgba(0,0,0,0.22) 22%, transparent 23%)",
      };
    }
    return styles;
  }, [fen, lastMove, selected, targets]);

  function applyMove(from: string, to: string) {
    const result = tryMove(fen, from, to);
    if (!result) {
      return false;
    }
    setSelection(null);
    onMove?.(result.fen, result.lastMove);
    return true;
  }

  return (
    <div className="aspect-square w-full overflow-hidden rounded-sm shadow-md">
      <Chessboard
        options={{
          id: "game-board",
          position: fen,
          boardOrientation: orientation === "w" ? "white" : "black",
          allowDragging: allowMoves,
          showNotation: true,
          animationDurationInMs: 280,
          squareStyles,
          boardStyle: {
            width: "100%",
          },
          darkSquareStyle: { backgroundColor: "#739552" },
          lightSquareStyle: { backgroundColor: "#ebecd0" },
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!allowMoves || !targetSquare) {
              return false;
            }
            return applyMove(sourceSquare, targetSquare);
          },
          onSquareClick: ({ square }) => {
            if (!allowMoves) {
              return;
            }
            if (selected) {
              if (selected === square) {
                setSelection(null);
                return;
              }
              if (applyMove(selected, square)) {
                return;
              }
            }
            const color = pieceColorOnSquare(fen, square);
            if (color && color === turnFromFen(fen)) {
              setSelection({ fen, square });
            } else {
              setSelection(null);
            }
          },
        }}
      />
    </div>
  );
}
