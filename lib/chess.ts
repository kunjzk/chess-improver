import { Chess, DEFAULT_POSITION, type Square } from "chess.js";
import type { LastMove, PlayerColor } from "./types";

export const STARTING_FEN = DEFAULT_POSITION;

export type ParsedGame = {
  headers: Record<string, string>;
  moves: {
    san: string;
    from: string;
    to: string;
    color: PlayerColor;
    after: string;
  }[];
};

export function parsePgn(pgn: string): ParsedGame {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn.trim());
  } catch {
    throw new Error("Could not parse that PGN.");
  }

  const moves = chess.history({ verbose: true }).map((move) => ({
    san: move.san,
    from: move.from,
    to: move.to,
    color: move.color,
    after: move.after,
  }));

  return {
    headers: chess.getHeaders(),
    moves,
  };
}

export function fenAtPly(game: ParsedGame, ply: number) {
  if (ply <= 0) {
    return DEFAULT_POSITION;
  }
  return game.moves[ply - 1]?.after ?? DEFAULT_POSITION;
}

export function lastMoveAtPly(game: ParsedGame, ply: number): LastMove | null {
  if (ply <= 0) {
    return null;
  }
  const move = game.moves[ply - 1];
  if (!move) {
    return null;
  }
  return { from: move.from, to: move.to };
}

export function sideToMove(ply: number): PlayerColor {
  return ply % 2 === 0 ? "w" : "b";
}

export function plyLabel(game: ParsedGame, ply: number) {
  const turn = sideToMove(ply) === "w" ? "White" : "Black";
  if (ply <= 0) {
    return `Starting position · ${turn} to move`;
  }

  const move = game.moves[ply - 1];
  if (!move) {
    return `Move ${ply} · ${turn} to move`;
  }

  const moveNumber = Math.ceil(ply / 2);
  const after =
    move.color === "w"
      ? `After ${moveNumber}. ${move.san}`
      : `After ${moveNumber}... ${move.san}`;
  return `${after} · ${turn} to move`;
}

export function inferMyColor(
  headers: Record<string, string>,
  username: string,
): PlayerColor {
  const normalized = username.trim().toLowerCase();
  if (!normalized) {
    return "w";
  }
  if ((headers.White ?? "").toLowerCase() === normalized) {
    return "w";
  }
  if ((headers.Black ?? "").toLowerCase() === normalized) {
    return "b";
  }
  return "w";
}

export function tryMove(
  fen: string,
  from: string,
  to: string,
): { fen: string; lastMove: LastMove } | null {
  const chess = new Chess(fen);
  const legal = chess
    .moves({ square: from as Square, verbose: true })
    .filter((move) => move.to === to);

  if (legal.length === 0) {
    return null;
  }

  const needsPromotion = legal.some((move) => Boolean(move.promotion));
  try {
    const move = chess.move({
      from,
      to,
      promotion: needsPromotion ? "q" : undefined,
    });
    return {
      fen: chess.fen(),
      lastMove: { from: move.from, to: move.to },
    };
  } catch {
    return null;
  }
}

export function legalTargets(fen: string, from: string) {
  const chess = new Chess(fen);
  return chess
    .moves({ square: from as Square, verbose: true })
    .map((move) => move.to);
}

export function pieceColorOnSquare(fen: string, square: string): PlayerColor | null {
  const chess = new Chess(fen);
  const piece = chess.get(square as Square);
  return piece?.color ?? null;
}

export function turnFromFen(fen: string): PlayerColor {
  return new Chess(fen).turn();
}

export function isLightSquare(square: string) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return (file + rank) % 2 === 0;
}

const PIECE_ORDER = ["q", "r", "b", "n", "p"] as const;
const STARTING_COUNTS: Record<(typeof PIECE_ORDER)[number], number> = {
  q: 1,
  r: 2,
  b: 2,
  n: 2,
  p: 8,
};
const PIECE_SYMBOL: Record<PlayerColor, Record<(typeof PIECE_ORDER)[number], string>> =
  {
    w: { q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
    b: { q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
  };

export function capturedPieces(fen: string) {
  const placement = fen.split(" ")[0] ?? "";
  const counts: Record<PlayerColor, Record<(typeof PIECE_ORDER)[number], number>> = {
    w: { q: 0, r: 0, b: 0, n: 0, p: 0 },
    b: { q: 0, r: 0, b: 0, n: 0, p: 0 },
  };

  for (const char of placement) {
    switch (char) {
      case "Q":
        counts.w.q += 1;
        break;
      case "R":
        counts.w.r += 1;
        break;
      case "B":
        counts.w.b += 1;
        break;
      case "N":
        counts.w.n += 1;
        break;
      case "P":
        counts.w.p += 1;
        break;
      case "q":
        counts.b.q += 1;
        break;
      case "r":
        counts.b.r += 1;
        break;
      case "b":
        counts.b.b += 1;
        break;
      case "n":
        counts.b.n += 1;
        break;
      case "p":
        counts.b.p += 1;
        break;
      default:
        break;
    }
  }

  function missing(color: PlayerColor) {
    const symbols: string[] = [];
    for (const type of PIECE_ORDER) {
      const taken = Math.max(0, STARTING_COUNTS[type] - counts[color][type]);
      for (let i = 0; i < taken; i += 1) {
        symbols.push(PIECE_SYMBOL[color][type]);
      }
    }
    return symbols;
  }

  return { w: missing("w"), b: missing("b") };
}
