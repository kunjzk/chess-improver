import { AddPositionForm } from "@/components/AddPositionForm";
import { Header } from "@/components/Header";
import { chessUsername } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function NewPositionPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
      <Header title="Add position" backHref="/" />
      <main className="flex-1 px-3 py-4">
        <AddPositionForm defaultUsername={chessUsername()} />
      </main>
    </div>
  );
}
