import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#166534]">
        404 — Page not found
      </p>
      <h1 className="mt-4 font-display text-6xl font-semibold tracking-tight text-[#101410] sm:text-7xl">
        Lost in the code.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[#5F665F]">
        The page you are looking for does not exist or was moved. Let&apos;s get
        you back to something real.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#101410] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 rounded-full border border-[#E6E8E2] px-6 py-3 text-sm font-medium text-[#101410] transition-colors hover:border-[#101410]"
        >
          <Compass className="h-4 w-4" />
          Browse projects
        </Link>
      </div>
    </main>
  );
}
