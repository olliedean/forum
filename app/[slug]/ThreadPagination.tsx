export default function ThreadPagination() {
  return (
    <nav
      aria-label="Thread pagination"
      className="flex h-8 items-center justify-between border-b border-slate-200 bg-gray-100 pl-2"
    >
      <span className="text-xs text-slate-500">Page 1 of 1</span>
      <div className="flex text-xs text-slate-400">
        <button
          type="button"
          aria-current="page"
          className="h-8 border-l border-slate-200 px-4 transition-colors hover:bg-slate-50"
        >
          1
        </button>
      </div>
    </nav>
  );
}
