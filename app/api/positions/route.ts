import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { inferMyColor, parsePgn } from "@/lib/chess";
import { chessUsername } from "@/lib/config";
import { createPosition, loadPositions } from "@/lib/store";
import type { PlayerColor, Question } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const positions = await loadPositions();
  return NextResponse.json({ positions });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    pgn?: string;
    ply?: number;
    myColor?: PlayerColor;
    questions?: { prompt?: string; answer?: string }[];
  };

  const pgn = body.pgn?.trim() ?? "";
  if (!pgn) {
    return NextResponse.json({ error: "PGN is required" }, { status: 400 });
  }

  let game;
  try {
    game = parsePgn(pgn);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid PGN" },
      { status: 400 },
    );
  }

  const ply = Number(body.ply);
  if (!Number.isInteger(ply) || ply < 0 || ply > game.moves.length) {
    return NextResponse.json({ error: "Invalid move number" }, { status: 400 });
  }

  const myColor: PlayerColor =
    body.myColor === "b" || body.myColor === "w"
      ? body.myColor
      : inferMyColor(game.headers, chessUsername());

  const questions: Question[] = (body.questions ?? [])
    .map((question) => ({
      id: crypto.randomUUID(),
      prompt: question.prompt?.trim() ?? "",
      answer: question.answer?.trim() ?? "",
    }))
    .filter((question) => question.prompt);

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "Add at least one question" },
      { status: 400 },
    );
  }

  const position = await createPosition({
    pgn,
    ply,
    myColor,
    questions,
    starred: false,
    white: game.headers.White,
    black: game.headers.Black,
  });

  revalidatePath("/");
  revalidatePath(`/positions/${position.id}`);

  return NextResponse.json({ position }, { status: 201 });
}
