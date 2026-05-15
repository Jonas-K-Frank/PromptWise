"use client";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-sm font-medium">Something went wrong.</p>
      <button
        className="text-sm text-muted-foreground underline"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
