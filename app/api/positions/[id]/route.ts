import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deletePosition, getPosition, setStarred } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const position = await getPosition(id);
  if (!position) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ position });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json()) as { starred?: unknown };
  if (typeof body.starred !== "boolean") {
    return NextResponse.json(
      { error: "starred must be a boolean" },
      { status: 400 },
    );
  }

  const position = await setStarred(id, body.starred);
  if (!position) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath(`/positions/${id}`);
  return NextResponse.json({ position });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const deleted = await deletePosition(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  revalidatePath("/");
  revalidatePath(`/positions/${id}`);
  return NextResponse.json({ ok: true });
}
