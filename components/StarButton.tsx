"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StarButton({
  positionId,
  starred,
  onStarredChange,
}: {
  positionId: string;
  starred: boolean;
  onStarredChange?: (starred: boolean) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(starred);
  const [prevStarred, setPrevStarred] = useState(starred);
  const [pending, setPending] = useState(false);

  if (starred !== prevStarred) {
    setPrevStarred(starred);
    setValue(starred);
  }

  async function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const next = !value;
    setValue(next);
    setPending(true);
    try {
      const response = await fetch(`/api/positions/${positionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: next }),
      });
      if (!response.ok) {
        setValue(!next);
        return;
      }
      onStarredChange?.(next);
      router.refresh();
    } catch {
      setValue(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      aria-pressed={value}
      aria-label={value ? "Unstar position" : "Star position"}
      disabled={pending}
      onClick={toggle}
      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-2xl leading-none"
    >
      <span className={value ? "text-[#f0c14b]" : "text-[#6f6f6f]"}>
        {value ? "★" : "☆"}
      </span>
    </button>
  );
}
