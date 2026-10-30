import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function ThreadPagination() {
  return (
    <nav
      aria-label="Thread pagination"
      className="flex min-h-[52px] items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-5"
    >
      <p className="text-xs text-slate-500">0 threads</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled
          className="flex size-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-300"
        >
          <FiChevronLeft aria-hidden="true" className="size-4" />
        </button>
        <span className="flex size-8 items-center justify-center rounded bg-[#327db4] text-xs font-medium text-white">
          0
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled
          className="flex size-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-300"
        >
          <FiChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </nav>
  );
}
