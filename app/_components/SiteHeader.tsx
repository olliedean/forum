"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaCalendar, FaHome } from "react-icons/fa";
import { FiChevronDown, FiLogOut, FiLoader } from "react-icons/fi";
import { useAuthSession } from "./useAuthSession";

type SiteBreadcrumb = {
  label: string;
  href?: string;
};

function parseBreadcrumbPayload(value: unknown): SiteBreadcrumb[] {
  if (typeof value !== "object" || value === null || !("items" in value)) {
    throw new Error("Breadcrumb response was invalid.");
  }
  const items = value.items;
  if (!Array.isArray(items)) throw new Error("Breadcrumb response was invalid.");

  return items.map((item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      !("label" in item) ||
      typeof item.label !== "string" ||
      (("href" in item) &&
        item.href !== undefined &&
        (typeof item.href !== "string" ||
          !item.href.startsWith("/") ||
          item.href.startsWith("//")))
    ) {
      throw new Error("Breadcrumb response was invalid.");
    }
    return {
      label: item.label,
      ...("href" in item && typeof item.href === "string" ? { href: item.href } : {}),
    };
  });
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
  const [breadcrumbResult, setBreadcrumbResult] = useState<{
    pathname: string;
    items: SiteBreadcrumb[];
  } | null>(null);
  const [breadcrumbFailure, setBreadcrumbFailure] = useState<{
    pathname: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBreadcrumbs() {
      try {
        const response = await fetch(
          `/api/forum/breadcrumbs?path=${encodeURIComponent(pathname)}`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Could not load navigation breadcrumbs.");
        const payload: unknown = await response.json();
        if (controller.signal.aborted) return;
        setBreadcrumbResult({
          pathname,
          items: parseBreadcrumbPayload(payload),
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setBreadcrumbFailure({
          pathname,
          message:
            error instanceof Error ? error.message : "Could not load navigation breadcrumbs.",
        });
      }
    }

    void loadBreadcrumbs();
    return () => controller.abort();
  }, [pathname]);

  const breadcrumbs =
    breadcrumbResult?.pathname === pathname ? breadcrumbResult.items : null;
  const breadcrumbError =
    breadcrumbFailure?.pathname === pathname ? breadcrumbFailure.message : null;

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
          <div
            role="group"
            aria-label="Breadcrumb"
            className="flex h-full min-w-0 items-center overflow-x-auto"
          >
            <Link
              href="/"
              aria-label="Home"
              className="flex h-full shrink-0 items-center rounded-tl-xl px-4 text-[#555] transition-colors hover:bg-slate-100"
            >
              <FaHome className="size-4" />
            </Link>
            {breadcrumbError ? (
              <span role="alert" className="px-2 text-xs text-red-700">
                Breadcrumbs unavailable
              </span>
            ) : breadcrumbs === null ? (
              <span aria-live="polite" className="px-2 text-slate-400">
                …
              </span>
            ) : breadcrumbs.length === 0 ? (
              <></>
            ) : (
              <>
                <span aria-hidden="true" className="shrink-0 text-slate-300">/</span>
                {breadcrumbs.map((item, index) => {
                  const isCurrent = index === breadcrumbs.length - 1;
                  return (
                    <span
                      key={`${item.label}-${index}`}
                      className="flex min-w-0 shrink-0 items-center gap-2"
                    >
                      {item.href && !isCurrent ? (
                        <Link
                          href={item.href}
                          className="max-w-56 truncate px-1 text-slate-600 hover:text-[#327db4] hover:underline"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          aria-current={isCurrent ? "page" : undefined}
                          className={`max-w-64 truncate px-1 ${
                            isCurrent ? "font-medium text-slate-700" : "text-slate-600"
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                      {!isCurrent && (
                        <span aria-hidden="true" className="text-slate-300">/</span>
                      )}
                    </span>
                  );
                })}
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
