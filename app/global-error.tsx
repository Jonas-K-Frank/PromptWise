"use client";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">Something went wrong.</p>
          <button onClick={reset} type="button">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
