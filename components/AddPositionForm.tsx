"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GameBoard } from "@/components/GameBoard";
import {
  fenAtPly,
  inferMyColor,
  lastMoveAtPly,
  parsePgn,
  plyLabel,
  STARTING_FEN,
  type ParsedGame,
} from "@/lib/chess";
import type { PlayerColor } from "@/lib/types";

const DEFAULT_QUESTION = "What is the next best move?";

type DraftQuestion = {
  key: string;
  prompt: string;
  answer: string;
};

export function AddPositionForm({
  defaultUsername,
}: {
  defaultUsername: string;
}) {
  const router = useRouter();
  const [pgn, setPgn] = useState("");
  const [ply, setPly] = useState(0);
  const [myColor, setMyColor] = useState<PlayerColor>("w");
  const [colorTouched, setColorTouched] = useState(false);
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    { key: crypto.randomUUID(), prompt: DEFAULT_QUESTION, answer: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parsed = useMemo<{ game: ParsedGame | null; error: string | null }>(
    () => {
      const trimmed = pgn.trim();
      if (!trimmed) {
        return { game: null, error: null };
      }
      try {
        return { game: parsePgn(trimmed), error: null };
      } catch (parseError) {
        return {
          game: null,
          error:
            parseError instanceof Error
              ? parseError.message
              : "Could not parse that PGN.",
        };
      }
    },
    [pgn],
  );

  const maxPly = parsed.game?.moves.length ?? 0;
  const safePly = Math.min(Math.max(ply, 0), maxPly);
  const fen = parsed.game ? fenAtPly(parsed.game, safePly) : STARTING_FEN;
  const lastMove = parsed.game ? lastMoveAtPly(parsed.game, safePly) : null;
  const label = parsed.game
    ? plyLabel(parsed.game, safePly)
    : "Paste a PGN to pick a move";

  const inferredColor = parsed.game
    ? inferMyColor(parsed.game.headers, defaultUsername)
    : "w";
  const color = colorTouched ? myColor : inferredColor;

  function updatePgn(value: string) {
    setPgn(value);
    setPly(0);
    setColorTouched(false);
    setError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!parsed.game) {
      setError(parsed.error ?? "Paste a PGN first.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pgn,
          ply: safePly,
          myColor: color,
          questions: questions.map(({ prompt, answer }) => ({ prompt, answer })),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        position?: { id: string };
      };
      if (!response.ok) {
        setError(data.error ?? "Could not save position.");
        return;
      }
      router.push(`/positions/${data.position?.id}`);
      router.refresh();
    } catch {
      setError("Could not save position.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 pb-8">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">PGN</span>
        <textarea
          value={pgn}
          onChange={(event) => updatePgn(event.target.value)}
          placeholder="Paste a Chess.com PGN"
          className="min-h-40 rounded-xl bg-[#262421] px-3 py-3 text-sm leading-6 text-[#f0f0f0] outline-none ring-1 ring-white/10"
        />
      </label>

      {parsed.error ? (
        <p className="text-sm text-[#f07167]">{parsed.error}</p>
      ) : null}

      <div className="flex flex-col gap-3">
        <GameBoard fen={fen} orientation={color} lastMove={lastMove} />
        <p className="text-center text-sm text-[#d0d0d0]">{label}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex-1 rounded-lg bg-[#3d3a37] font-semibold disabled:opacity-40"
            disabled={safePly <= 0}
            onClick={() => setPly((value) => Math.max(0, value - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg bg-[#3d3a37] font-semibold disabled:opacity-40"
            disabled={!parsed.game || safePly >= maxPly}
            onClick={() => setPly((value) => Math.min(maxPly, value + 1))}
          >
            Next
          </button>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Your color</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["w", "b"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMyColor(value);
                setColorTouched(true);
              }}
              className={`rounded-lg font-semibold ${
                color === value
                  ? "bg-[#81b64c] text-[#1f1f1f]"
                  : "bg-[#3d3a37] text-[#f0f0f0]"
              }`}
            >
              {value === "w" ? "White" : "Black"}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Questions</p>
        {questions.map((question, index) => (
          <div key={question.key} className="rounded-xl bg-[#262421] p-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[#b0b0b0]">Question {index + 1}</span>
              <input
                value={question.prompt}
                onChange={(event) =>
                  setQuestions((current) =>
                    current.map((item) =>
                      item.key === question.key
                        ? { ...item, prompt: event.target.value }
                        : item,
                    ),
                  )
                }
                className="rounded-lg bg-[#1f1e1c] px-3 text-sm outline-none"
              />
            </label>
            <label className="mt-3 flex flex-col gap-1">
              <span className="text-xs text-[#b0b0b0]">Answer</span>
              <textarea
                value={question.answer}
                onChange={(event) =>
                  setQuestions((current) =>
                    current.map((item) =>
                      item.key === question.key
                        ? { ...item, answer: event.target.value }
                        : item,
                    ),
                  )
                }
                className="min-h-20 rounded-lg bg-[#1f1e1c] px-3 py-2 text-sm outline-none"
              />
            </label>
            {questions.length > 1 ? (
              <button
                type="button"
                className="mt-2 text-sm text-[#f07167]"
                onClick={() =>
                  setQuestions((current) =>
                    current.filter((item) => item.key !== question.key),
                  )
                }
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
        <button
          type="button"
          className="rounded-lg bg-[#3d3a37] font-semibold"
          onClick={() =>
            setQuestions((current) => [
              ...current,
              { key: crypto.randomUUID(), prompt: "", answer: "" },
            ])
          }
        >
          Add question
        </button>
      </div>

      {error ? <p className="text-sm text-[#f07167]">{error}</p> : null}

      <button
        type="submit"
        disabled={saving || !parsed.game}
        className="rounded-lg bg-[#81b64c] font-semibold text-[#1f1f1f] disabled:opacity-40"
      >
        {saving ? "Saving…" : "Save position"}
      </button>
    </form>
  );
}
