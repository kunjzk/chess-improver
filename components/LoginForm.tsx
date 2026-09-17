"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError("Wrong password");
        return;
      }
      router.push(nextPath || "/");
      router.refresh();
    } catch {
      setError("Could not log in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg bg-[#262421] px-3 text-base outline-none ring-1 ring-white/10"
          autoComplete="current-password"
        />
      </label>
      {error ? <p className="text-sm text-[#f07167]">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-[#81b64c] font-semibold text-[#1f1f1f]"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
