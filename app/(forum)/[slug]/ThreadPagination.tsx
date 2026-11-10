import Link from "next/link";

type ThreadPaginationProps = {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  label: string;
};

export default function ThreadPagination({
  currentPage,
  totalPages,
  hrefForPage,
  label,
}: ThreadPaginationProps) {
  if (totalPages <= 1) return null;

  const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const lastPage = Math.min(totalPages, firstPage + 4);

  return (
    <nav
      aria-label={`${label} pagination`}
      className="flex min-h-8 items-center justify-between border-b border-slate-200 bg-gray-100 pl-2"
    >
      <span className="py-1 text-xs text-slate-500">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex text-xs text-slate-600">
        {currentPage > 1 && (
          <Link
            href={hrefForPage(currentPage - 1)}
            rel="prev"
            className="flex h-8 items-center border-l border-slate-200 px-3 transition-colors hover:bg-slate-50"
          >
            Previous
          </Link>
        )}
        {Array.from({ length: lastPage - firstPage + 1 }, (_, index) => {
          const page = firstPage + index;
          return (
            <Link
              key={page}
              href={hrefForPage(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`flex h-8 items-center border-l border-slate-200 px-3 transition-colors hover:bg-slate-50 ${
                page === currentPage ? "font-semibold text-[#327db4]" : ""
              }`}
            >
              {page}
            </Link>
          );
        })}
        {currentPage < totalPages && (
          <Link
            href={hrefForPage(currentPage + 1)}
            rel="next"
            className="flex h-8 items-center border-l border-slate-200 px-3 transition-colors hover:bg-slate-50"
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
