import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

type NewThreadPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: NewThreadPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `New Thread - ${slug} - Forum`,
    description: "Create a new forum thread in this category.",
  };
}

async function NewThreadContent({ params }: NewThreadPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-b-xl border border-t-0 border-slate-200 bg-white shadow-xl md:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="order-2 border-b border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 md:order-1 md:border-b-0 md:border-r">
        sidebar content, idk what to put here yet lol
      </aside>

      <main className="order-1 min-w-0 bg-white md:order-2">
        <div className="p-4 sm:p-5">
          <h1 className="mb-4 text-lg font-semibold text-slate-700">Create a new thread</h1>
          <form action="#" className="overflow-hidden border border-slate-200">
            <div className="grid border-b border-slate-200 sm:grid-cols-[150px_minmax(0,1fr)]">
              <label
                htmlFor="thread-title"
                className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-xs font-medium text-slate-600 sm:border-b-0 sm:border-r"
              >
                Thread title
              </label>
              <div className="p-3">
                <input
                  id="thread-title"
                  type="text"
                  defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
                  className="w-full rounded-sm border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-[#327db4]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-[150px_minmax(0,1fr)]">
              <label
                htmlFor="thread-body"
                className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-xs font-medium text-slate-600 sm:border-b-0 sm:border-r"
              >
                Message
              </label>
              <div className="p-3">
                <textarea
                  id="thread-body"
                  rows={14}
                  defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                  className="w-full resize-y rounded-sm border border-slate-300 bg-white px-2.5 py-2 text-sm leading-6 text-slate-700 outline-none focus:border-[#327db4]"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-3 py-2">
              <button
                type="submit"
                className="rounded-sm border border-[#286a9b] bg-[#327db4] px-4 py-2 text-xs font-medium text-white hover:bg-[#286a9b]"
              >
                Create Thread
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function NewThreadPage({ params }: NewThreadPageProps) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-96 grid-cols-1 rounded-b-xl border border-t-0 border-slate-200 bg-white shadow-xl md:grid-cols-[250px_minmax(0,1fr)]">
          <div className="hidden border-r border-slate-200 bg-slate-50 md:block" />
          <main className="animate-pulse p-6">
            <div className="h-8 w-40 rounded bg-slate-100" />
            <div className="mt-4 h-12 w-full rounded bg-slate-100" />
            <div className="mt-6 h-72 rounded bg-slate-50" />
          </main>
        </div>
      }
    >
      <NewThreadContent params={params} />
    </Suspense>
  );
}
