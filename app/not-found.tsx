import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="bg-background text-primary grid min-h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-600">404</p>
        <h1 className="text-primary mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
          Page not found
        </h1>
        <p className="text-primary mt-6 text-lg font-medium text-pretty sm:text-xl/8">
          Sorry, we couldn&rsquo;t find the page you&rsquo;re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/">
            <Button className="bg-indigo-600 font-bold text-white hover:bg-indigo-500">
              Go back home
            </Button>
          </Link>
          <a
            href="https://github.com/Axyl1410/"
            className="text-primary text-sm font-semibold"
            target="_blank"
          >
            Contact support <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
