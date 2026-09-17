export type PlayerColor = "w" | "b";

export type Question = {
  id: string;
  prompt: string;
  answer: string;
};

export type Position = {
  id: string;
  createdAt: string;
  pgn: string;
  ply: number;
  myColor: PlayerColor;
  questions: Question[];
  white?: string;
  black?: string;
};

export type LastMove = {
  from: string;
  to: string;
};
