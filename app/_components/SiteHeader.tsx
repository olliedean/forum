"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { FaCalendar, FaHome } from "react-icons/fa";
import { FiChevronDown, FiLogOut, FiLoader } from "react-icons/fi";
import { useAuthSession } from "./useAuthSession";

function formatSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SiteHeader() {
  const pathname = usePathname();
  const {
    user,
    isLoading,
    error: sessionError,
    signingOut,
    signOut: signOutSession,
  } = useAuthSession();
  const accountMenu = useRef<HTMLDetailsElement>(null);
  const categoryMatch = pathname.match(/^\/([^/]+)$/);
  const categorySlug = categoryMatch?.[1] ?? "";
  const categoryName = categorySlug ? formatSlug(categorySlug) : "";

  async function signOut() {
    if (await signOutSession()) {
      if (accountMenu.current) accountMenu.current.open = false;
    }
  }

  return (
    <>
      <div className="relative flex h-[50px] items-center justify-end px-3 text-[12px] text-white">
        {/* logo would go here */}
        <a href="#" className="relative z-10 mr-3 hover:underline">Discord</a>
      </div>

      <header className="relative z-10 rounded-t-xl border border-b-0 border-[#e5e7eb] bg-white shadow-sm">
        <nav
          aria-label="Forum navigation"
          className="flex h-[40px] items-center justify-between border-b border-[#e5e7eb] text-[13px]"
        >
          <div className="flex h-full items-center">
          <Link href="/" aria-label="Home" className="flex overflow-hidden h-full items-center px-4 text-[#555] transition-colors hover:bg-slate-100 rounded-tl-xl">
            <FaHome className="size-4" />
          </Link>
          {categoryName && (
            <>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span className="flex h-full items-center px-3 text-slate-700">
                {categoryName}
              </span>
            </>
          )}
          </div>
          <div className="flex h-full">
            {isLoading ? (
              <span className="flex h-full items-center border-l border-[#e5e7eb] px-4 text-slate-400">
                …
              </span>
            ) : user ? (
              <details ref={accountMenu} className="group relative h-full">
                <summary
                  aria-label="Account menu"
                  className="flex h-full max-w-44 cursor-pointer list-none items-center gap-2 border-l border-[#e5e7eb] px-4 text-[#555] transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#327db4] [&::-webkit-details-marker]:hidden"
                >
                  <span className="truncate">{user.username}</span>
                  <FiChevronDown
                    className="size-3 shrink-0 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="absolute right-0 top-full z-20 hidden w-48 flex-col border border-t-0 border-[#e5e7eb] bg-white py-1 text-[#555] shadow-md group-open:flex">
                  <Link
                    href={`/u/${encodeURIComponent(user.id)}`}
                    className="px-4 py-2 hover:bg-slate-100"
                  >
                    View profile
                  </Link>
                  {sessionError && (
                    <p className="border-t border-slate-100 px-4 py-2 text-xs text-red-700" role="alert">
                      {sessionError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={signOut}
                    disabled={signingOut}
                    className="flex items-center gap-2 border-t border-slate-100 px-4 py-2 text-left hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
                  >
                    {signingOut ? (
                      <FiLoader className="animate-spin" aria-hidden="true" />
                    ) : (
                      <FiLogOut aria-hidden="true" />
                    )}
                    Sign out
                  </button>
                </div>
              </details>
            ) : (
              <Link
                href="/login"
                className="flex h-full items-center gap-2 border-l border-[#e5e7eb] px-4 text-[#555] transition-colors hover:bg-slate-100"
                title={sessionError || undefined}
              >
                Login/Join
              </Link>
            )}
            <details className="group relative h-full">
              <summary
                aria-label="event log menu"
                className="flex h-full cursor-pointer list-none items-center gap-2 rounded-tr-xl border-l border-[#e5e7eb] px-4 text-[#555] transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#327db4] [&::-webkit-details-marker]:hidden"
              >
                <FiChevronDown
                  className="size-3 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="absolute right-0 top-full z-20 hidden w-48 flex-col border border-t-0 border-[#e5e7eb] bg-white py-1 shadow-md group-open:flex">
                <Link
                  href="/events"
                  className="flex items-center px-4 py-2 text-[#555] transition-colors hover:bg-slate-100"
                >
                  <FaCalendar className="size-3 mr-2" aria-hidden="true" />
                  Event Log
                </Link>
              </div>
            </details>
          </div>
        </nav>
      </header>
    </>
  );
}
