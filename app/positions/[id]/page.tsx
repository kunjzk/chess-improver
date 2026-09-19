import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ReviewClient } from "@/components/ReviewClient";
import { getPosition, loadPositions } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { id } = await params;
  const { filter } = await searchParams;
  const starredOnly = filter === "starred";
  const [position, positions] = await Promise.all([
    getPosition(id),
    loadPositions(),
  ]);

  if (!position) {
    notFound();
  }

  const reviewIds = (starredOnly
    ? positions.filter((item) => item.starred || item.id === position.id)
    : positions
  ).map((item) => item.id);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
      <Header
        title="Review"
        backHref={starredOnly ? "/?filter=starred" : "/"}
      />
      <ReviewClient
        key={position.id}
        position={position}
        positionIds={reviewIds}
        reviewQuery={starredOnly ? "?filter=starred" : ""}
      />
    </div>
  );
}
