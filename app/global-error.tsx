"use client"; // Error boundaries must be Client Components

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <div className="bg-background text-primary flex h-screen w-full flex-col items-center justify-center gap-4">
          <h2>Something went wrong!</h2>
          <p className="max-w-3xl text-center text-sm/6 text-balance">
            {error.message}
          </p>
          <div className="grid grid-cols-2 items-center justify-center gap-2">
            <a
              href="https://github.com/Axyl1410/store-nations-clone/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="cursor-pointer">Report Error on GitHub</Button>
            </a>
            <Button
              className="cursor-pointer bg-sky-500 hover:bg-sky-600"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
