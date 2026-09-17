import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ReviewClient } from "@/components/ReviewClient";
import { getPosition, loadPositions, neighbors } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [position, positions] = await Promise.all([
    getPosition(id),
    loadPositions(),
  ]);

  if (!position) {
    notFound();
  }

  const { prevId, nextId, index, total } = neighbors(positions, position.id);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
      <Header title="Review" backHref="/" />
      <ReviewClient
        key={position.id}
        position={position}
        prevId={prevId}
        nextId={nextId}
        index={index}
        total={total}
      />
    </div>
  );
}
