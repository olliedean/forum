import Sidebar from "./Sidebar";
import ParentCategory from "./ParentCategory";
import { FiSearch } from "react-icons/fi";

export default function Home() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-b-xl border border-t-0 border-[#e5e7eb] bg-white shadow-xl md:grid-cols-[250px_minmax(0,1fr)]">
      <header className="col-span-full flex min-h-[92px] items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-[34px] tracking-tight text-slate-700">
            Forum Name
          </h1>
          <p className="text-sm leading-5 text-slate-500">
            0 registered users have made 0 posts in 0 threads.
          </p>
        </div>
        <form
          action="#"
          role="search"
          className="hidden h-[38px] w-[270px] shrink-0 overflow-hidden rounded-md border border-slate-200 sm:flex"
        >
          <input
            aria-label="Search forums"
            placeholder="Search..."
            className="min-w-0 flex-1 px-3 text-[13px] outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex w-[42px] items-center justify-center bg-[#327db4] text-white transition-colors hover:bg-[#286a9b]"
          >
            <FiSearch className="size-4" />
          </button>
        </form>
      </header>
      <div className="order-2 bg-[#fafafa] md:order-1">
        <Sidebar />
      </div>
      <main className="order-1 min-w-0 md:order-2">
        {Array.from({ length: 2 }, (_, index) => (
          <ParentCategory key={index} />
        ))}
      </main>
    </div>
  );
}
