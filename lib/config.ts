export const DEFAULT_CHESS_USERNAME = "hoptheponyfrythechicken";

export function chessUsername() {
  return process.env.CHESS_USERNAME?.trim() || DEFAULT_CHESS_USERNAME;
}
