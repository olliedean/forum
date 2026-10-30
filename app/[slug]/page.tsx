import { Suspense } from "react";
import type { Metadata } from "next";
import { FiSearch } from "react-icons/fi";
import CategorySidebar from "./CategorySidebar";
import CategoryThreadItem from "./CategoryThreadItem";
import ThreadPagination from "./ThreadPagination";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {

  return {
    title: `General - Forum`,
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  };
}

async function CategoryContent({ params }: CategoryPageProps) {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-b-xl border border-t-0 border-slate-200 bg-white shadow-xl md:grid-cols-[250px_minmax(0,1fr)]">
      <div className="order-2 bg-slate-50 md:order-1">
        <CategorySidebar />
      </div>
      <main className="order-1 min-w-0 md:order-2">
        <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold leading-8 text-slate-700">General</h1>
            <p className="mt-1 text-sm text-slate-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <form
            action="#"
            role="search"
            className="flex h-[38px] w-full shrink-0 overflow-hidden rounded-md border border-slate-200 sm:w-[250px]"
          >
            <input
              aria-label={`Search General`}
              placeholder="Search..."
              className="min-w-0 flex-1 px-3 text-sm outline-none placeholder:text-slate-400"
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

        <ThreadPagination />

        <section aria-label="Threads">
          {Array.from({ length: 10 }, (_, index) => (
            <CategoryThreadItem key={index} />
          ))}
        </section>

        <ThreadPagination />
      </main>
    </div>
  );
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-96 grid-cols-1 rounded-b-xl border border-t-0 border-slate-200 bg-white shadow-xl md:grid-cols-[250px_minmax(0,1fr)]">
          <div className="hidden border-r border-slate-200 bg-slate-50 md:block" />
          <main className="animate-pulse p-6">
            <div className="h-8 w-40 rounded bg-slate-100" />
            <div className="mt-3 h-4 w-72 max-w-full rounded bg-slate-100" />
            <div className="mt-8 space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="h-16 rounded bg-slate-50" />
              ))}
            </div>
          </main>
        </div>
      }
    >
      <CategoryContent params={params} />
    </Suspense>
  );
}
