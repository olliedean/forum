"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";

function formatSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SiteHeader() {
  const pathname = usePathname();
  const categoryMatch = pathname.match(/^\/([^/]+)$/);
  const categorySlug = categoryMatch?.[1] ?? "";
  const categoryName = categorySlug ? formatSlug(categorySlug) : "";

  return (
    <>
      <div className="relative flex h-[50px] items-center justify-end px-3 text-[12px] text-white">
        {/* logo would go here */}
        <a href="#" className="relative z-10 mr-3 hover:underline">Discord</a>
      </div>

      <header className="relative z-10 overflow-hidden rounded-t-xl border border-b-0 border-[#e5e7eb] bg-white shadow-sm">
        <nav
          aria-label="Forum navigation"
          className="flex h-[40px] items-center justify-between border-b border-[#e5e7eb] text-[13px]"
        >
          <div className="flex h-full items-center">
          <Link href="/" aria-label="Home" className="flex h-full items-center px-4 text-[#555] transition-colors hover:bg-slate-100">
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
          <a
            href="#"
            className="flex h-full items-center gap-2 border-l border-[#e5e7eb] px-4 text-[#555] transition-colors hover:bg-slate-100"
          >
            Login/Join
          </a>
          <a
            href="#"
            className="flex h-full items-center gap border-l-1 border-[#e5e7eb] px-4 text-[#555] transition-colors hover:bg-slate-100"
          >
            <FiChevronDown />
          </a>
          </div>
        </nav>
      </header>
    </>
  );
}
