import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">Position not found</h1>
      <Link
        href="/"
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#81b64c] px-4 font-semibold text-[#1f1f1f]"
      >
        Back to list
      </Link>
    </div>
  );
}
