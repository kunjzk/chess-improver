import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/";

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4">
      <h1 className="mb-6 text-center text-2xl font-semibold">Chess Improver</h1>
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
