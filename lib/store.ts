import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import type { Position } from "./types";

const BLOB_PATH = "positions.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "positions.json");

function blobEnabled() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

async function readLocal(): Promise<Position[]> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    const parsed = JSON.parse(raw) as Position[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeLocal(positions: Position[]) {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(positions, null, 2));
}

async function readBlob(): Promise<Position[]> {
  const result = await get(BLOB_PATH, {
    access: "private",
    useCache: false,
  });
  if (!result || result.statusCode !== 200) {
    return [];
  }
  const text = await new Response(result.stream).text();
  if (!text.trim()) {
    return [];
  }
  const parsed = JSON.parse(text) as Position[];
  return Array.isArray(parsed) ? parsed : [];
}

async function writeBlob(positions: Position[]) {
  await put(BLOB_PATH, JSON.stringify(positions, null, 2), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
    contentType: "application/json",
  });
}

export async function loadPositions(): Promise<Position[]> {
  const positions = blobEnabled() ? await readBlob() : await readLocal();
  return [...positions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function savePositions(positions: Position[]) {
  if (blobEnabled()) {
    await writeBlob(positions);
    return;
  }
  await writeLocal(positions);
}

export async function getPosition(id: string) {
  const positions = await loadPositions();
  return positions.find((position) => position.id === id) ?? null;
}

export async function createPosition(
  input: Omit<Position, "id" | "createdAt">,
): Promise<Position> {
  const positions = await loadPositions();
  const position: Position = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  positions.unshift(position);
  await savePositions(positions);
  return position;
}

export async function deletePosition(id: string) {
  const positions = await loadPositions();
  const next = positions.filter((position) => position.id !== id);
  if (next.length === positions.length) {
    return false;
  }
  await savePositions(next);
  return true;
}

export function neighbors(positions: Position[], id: string) {
  const index = positions.findIndex((position) => position.id === id);
  if (index === -1) {
    return { prevId: null, nextId: null, index: -1, total: positions.length };
  }
  return {
    prevId: positions[index - 1]?.id ?? null,
    nextId: positions[index + 1]?.id ?? null,
    index,
    total: positions.length,
  };
}
