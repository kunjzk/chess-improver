"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CapturedMaterial } from "@/components/CapturedMaterial";
import { GameBoard } from "@/components/GameBoard";
import {
  fenAtPly,
  lastMoveAtPly,
  parsePgn,
  plyLabel,
  STARTING_FEN,
} from "@/lib/chess";
import { useReviewOrder } from "@/lib/review-order";
import type { LastMove, Position } from "@/lib/types";

const navClassName =
  "flex h-11 w-full items-center justify-center rounded-lg bg-[#3d3a37] text-center text-sm font-semibold";

type Snapshot = {
  fen: string;
  lastMove: LastMove | null;
};

type ReviewClientProps = {
  position: Position;
  positionIds: string[];
};

export function ReviewClient({ position, positionIds }: ReviewClientProps) {
  const router = useRouter();
  const order = useReviewOrder(positionIds);
  const index = Math.max(0, order.indexOf(position.id));
  const total = order.length;
  const prevId = total > 1 ? order[(index - 1 + total) % total] : null;
  const nextId = total > 1 ? order[(index + 1) % total] : null;

  const parsed = useMemo(() => {
    try {
      return { game: parsePgn(position.pgn), error: null };
    } catch (error) {
      return {
        game: null,
        error:
          error instanceof Error ? error.message : "Could not parse that PGN.",
      };
    }
  }, [position.pgn]);

  const studyFen = parsed.game
    ? fenAtPly(parsed.game, position.ply)
    : STARTING_FEN;
  const studyLastMove = useMemo(
    () => (parsed.game ? lastMoveAtPly(parsed.game, position.ply) : null),
    [parsed.game, position.ply],
  );
  const preFen = parsed.game
    ? fenAtPly(parsed.game, Math.max(0, position.ply - 1))
    : studyFen;
  const label = parsed.game
    ? plyLabel(parsed.game, position.ply)
    : parsed.error ?? "Invalid PGN";

  const [fen, setFen] = useState(position.ply === 0 ? studyFen : preFen);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [allowMoves, setAllowMoves] = useState(position.ply === 0);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (position.ply === 0) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setFen(studyFen);
      setLastMove(studyLastMove);
    });
    const timer = window.setTimeout(() => setAllowMoves(true), 320);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [position.ply, studyFen, studyLastMove]);

  function resetBoard() {
    setFen(studyFen);
    setLastMove(studyLastMove);
    setAllowMoves(true);
    setHistory([]);
  }

  function undoMove() {
    const previous = history[history.length - 1];
    if (!previous) {
      return;
    }
    setHistory((current) => current.slice(0, -1));
    setFen(previous.fen);
    setLastMove(previous.lastMove);
  }

  async function deletePosition() {
    if (!window.confirm("Delete this position?")) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`/api/positions/${position.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        return;
      }
      const remaining = order.filter((id) => id !== position.id);
      const next = remaining[index] ?? remaining[index - 1];
      router.push(next ? `/positions/${next}` : "/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col px-3 py-4 pb-8">
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        {prevId ? (
          <Link href={`/positions/${prevId}`} className={navClassName}>
            Previous
          </Link>
        ) : (
          <span className={`${navClassName} opacity-40`}>Previous</span>
        )}
        <span className="min-w-16 text-center text-sm text-[#c8c8c8]">
          {index + 1} / {total}
        </span>
        {nextId ? (
          <Link href={`/positions/${nextId}`} className={navClassName}>
            Next
          </Link>
        ) : (
          <span className={`${navClassName} opacity-40`}>Next</span>
        )}
      </div>

      <GameBoard
        fen={fen}
        orientation={position.myColor}
        lastMove={lastMove}
        allowMoves={allowMoves}
        onMove={(nextFen, move) => {
          setHistory((current) => [...current, { fen, lastMove }]);
          setFen(nextFen);
          setLastMove(move);
        }}
      />

      <CapturedMaterial fen={fen} myColor={position.myColor} />

      <p className="mt-3 text-center text-sm text-[#d0d0d0]">{label}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={resetBoard}
          className="rounded-lg bg-[#3d3a37] font-semibold"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={undoMove}
          disabled={history.length === 0}
          className="rounded-lg bg-[#3d3a37] font-semibold disabled:opacity-40"
        >
          Undo
        </button>
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {position.questions.map((question) => (
          <li key={question.id} className="rounded-xl bg-[#262421] px-4 py-3">
            <p className="text-sm font-semibold">{question.prompt}</p>
            {showAnswers ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#d8d8d8]">
                {question.answer || "No answer saved."}
              </p>
            ) : (
              <p className="mt-2 text-sm text-[#8d8d8d]">Answer hidden</p>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setShowAnswers((value) => !value)}
        className="mt-4 rounded-lg bg-[#81b64c] font-semibold text-[#1f1f1f]"
      >
        {showAnswers ? "Hide answers" : "Show answers"}
      </button>

      <button
        type="button"
        onClick={deletePosition}
        disabled={deleting}
        className="mt-3 text-sm text-[#f07167]"
      >
        {deleting ? "Deleting…" : "Delete position"}
      </button>
    </main>
  );
}
