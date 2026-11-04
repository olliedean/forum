import Link from "next/link";
import { FaSearch, FaSignOutAlt } from "react-icons/fa";

export default function AdminHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#272b32] bg-[#181a1e] text-gray-200 shadow-sm">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link className="group flex items-center gap-2" href="/admincp">
            <span className="flex items-center gap-1.5 text-[14px] font-bold tracking-tight text-white">
              forum
              <span className="rounded border border-gray-700/70 bg-[#24282f] px-1.5 py-0.2 font-mono text-[11px] font-medium tracking-normal text-gray-300">
                admincp
              </span>
            </span>
          </Link>
        </div>

        <div className="mx-6 hidden max-w-sm flex-1 items-center lg:flex">
          <div className="relative w-full">
            <input
              aria-label="Search members, reports, IP, and threads"
              className="w-full rounded border border-[#2d323b] bg-[#131518] py-1.5 pl-8 pr-2.5 text-xs text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="Search members, reports, IP, threads..."
              type="search"
            />
            <FaSearch
              aria-hidden="true"
              className="pointer-events-none absolute top-2 left-2 text-[13px] text-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border-l border-gray-700/80 pl-2">
            <span
              aria-label="User"
              className="h-6 w-6 rounded border border-gray-600 bg-cover bg-center"
              role="img"
              style={{
                backgroundImage:
                  "url('/postbit-bg-example.avif')",
              }}
            />
            <span className="hidden text-xs font-semibold text-white sm:inline">
              user
            </span>
            <a
              aria-label="Logout"
              className="text-gray-400 transition-colors hover:text-white"
              href="/logout"
              title="Logout"
            >
              <FaSignOutAlt aria-hidden="true" className="text-[15px]" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
