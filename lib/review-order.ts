"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "chess-improver-review-order";

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function reviewOrder(ids: string[]): string[] {
  if (ids.length === 0) {
    return [];
  }

  let stored: string[] = [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    stored = raw ? (JSON.parse(raw) as string[]) : [];
    if (!Array.isArray(stored)) {
      stored = [];
    }
  } catch {
    stored = [];
  }

  const idSet = new Set(ids);
  const storedSet = new Set(stored);
  const kept = stored.filter((id) => idSet.has(id));
  const added = shuffle(ids.filter((id) => !storedSet.has(id)));
  const next = [...kept, ...added];
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function subscribe() {
  return () => {};
}

export function useReviewOrder(ids: string[]) {
  const idsKey = ids.join(",");
  const snapshot = useSyncExternalStore(
    subscribe,
    () => reviewOrder(idsKey.split(",").filter(Boolean)).join(","),
    () => idsKey,
  );
  return snapshot.split(",").filter(Boolean);
}
