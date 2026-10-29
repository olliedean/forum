import { FaHome } from "react-icons/fa";
import {
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";

export default function SiteHeader() {
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
          <a href="#" aria-label="Home" className="text-[#555] px-4 transition-colors hover:bg-slate-100 h-full flex items-center">
            <FaHome className="size-4" />
          </a>
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

        <div className="flex min-h-[92px] items-center justify-between gap-4 border-b border-[#e5e7eb] px-6 py-4">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold leading-[34px] tracking-tight text-[#4b5563]">
              Forum Name
            </h1>
            <p className="text-[14px] leading-5 text-[#8b929b]">
              0 registered users have make 0 posts in 0 threads.
            </p>
          </div>
          <form
            action="#"
            role="search"
            className="hidden h-[38px] w-[270px] shrink-0 overflow-hidden rounded-md border border-[#d7dce2] sm:flex"
          >
            <input
              aria-label="Search forums"
              placeholder="Search..."
              className="min-w-0 flex-1 px-3 text-[13px] outline-none placeholder:text-[#aaa]"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex w-[42px] items-center justify-center bg-[#327db4] text-white transition-colors hover:bg-[#286a9b]"
            >
              <FiSearch className="size-4" />
            </button>
          </form>
        </div>
      </header>
    </>
  );
}
