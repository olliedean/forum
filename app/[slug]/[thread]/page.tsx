import { Metadata } from "next";
import { FiSearch } from "react-icons/fi";

type ThreadPageProps = {
  params: {
    slug: string;
    thread: string;
  };
};

export async function generateMetadata({
  params,
}: ThreadPageProps): Promise<Metadata> {
  return {
    title: `Thread Title - Forum`,
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  };
}

export default function ThreadPage() {
  return(
    <div className="overflow-hidden rounded-b-xl border border-t-0 border-slate-200 bg-white shadow-xl">
      <header className="flex flex-col gap-4 border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold leading-8 text-slate-700">Thread Title</h1>
          <p className="text-sm text-slate-500">
            0 replies, posted 10 mins ago by <span className="font-medium text-slate-700">User</span>
          </p>
        </div>
        <form
          action="#"
          className="flex h-[38px] w-full shrink-0 overflow-hidden rounded-md border border-slate-200 sm:w-[250px]"
        >
          <input
            placeholder="Search..."
            className="min-w-0 flex-1 px-3 text-sm outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="flex w-[42px] items-center justify-center bg-[#327db4] text-white transition-colors hover:bg-[#286a9b]"
          >
            <FiSearch className="size-4" />
          </button>
        </form>
      </header>
      <div className="flex justify-between border-t border-slate-200 bg-gray-100 pl-2 items-center">
        <span className="text-xs text-slate-500">Page 1 of 1</span>
        <div className="flex text-xs text-slate-400">
          <button className="border-l border-slate-200 h-8 px-4 transition-colors hover:bg-slate-50">
            1
          </button>
        </div>
      </div>
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index}>
          <header className="bg-gray-100 px-2 py-1 text-xs text-slate-600 border-y border-slate-200">
            0 mins ago <span className="text-slate-500">from</span> United Kingdom
          </header>
          <div className="grid grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)]">
            {/* postbit */}
            <div className="relative order-2 bg-slate-50 md:order-1 border-r border-slate-200 group">
              {/* work in progress for the bg. will probably switch to bg-background for scaling */}
              <img src="/postbit-bg-example.avif" alt="postbit" className="grayscale opacity-20 group-hover:opacity-100 transition-all group-hover:transform group-hover:scale-105 group-hover:grayscale-0" />
              <a 
              className="absolute left-9 top-9 z-10 font-bold flex items-center gap-2 transition-colors group-hover:text-white hover:underline"
              href="/u/w9dw"
              >
                ollie <span className="text-xs font-normal text-slate-200 bg-slate-400 px-2 rounded">1</span>
              </a>
            </div>
            {/* post content */}
            <main className="order-1 min-w-0 min-h-72 md:order-2 p-4 text-sm">
              post content
            </main>
          </div>
        </div>
      ))}
    </div>
  )
}