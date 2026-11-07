import type { Metadata } from "next";
import Link from "next/link";

type InitPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    first?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Forum Installation",
};

const inputClassName =
  "mt-1 block w-full rounded-sm border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#327db4]";

export default async function InitPage({ searchParams }: InitPageProps) {
  const params = await searchParams;
  const isFirstSetup = params.first !== undefined && params.error === undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-4 py-10">
      <section className="w-full max-w-[560px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Forum installation
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-800">
            {isFirstSetup
              ? "Create the first administrator"
              : "Installation error"}
          </h1>
        </header>

        {isFirstSetup ? (
          <form action="#" className="space-y-4 p-5 sm:p-6">
            <p className="text-sm leading-6 text-slate-600">
              Set up the first administrator account to finish configuring your
              forum.
            </p>

            <label className="block text-xs font-medium text-slate-600">
              Username
              <input
                autoComplete="username"
                className={inputClassName}
                name="username"
                required
              />
            </label>

            <label className="block text-xs font-medium text-slate-600">
              Email address
              <input
                autoComplete="email"
                className={inputClassName}
                name="email"
                required
                type="email"
              />
            </label>

            <label className="block text-xs font-medium text-slate-600">
              Password
              <input
                autoComplete="new-password"
                className={inputClassName}
                name="password"
                required
                type="password"
              />
            </label>

            <button
              className="rounded-sm border border-[#286a9b] bg-[#327db4] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#286a9b]"
              type="submit"
            >
              Create administrator
            </button>
          </form>
        ) : (
          <div className="p-5 sm:p-6">
            <div
              aria-live="polite"
              className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              role="alert"
            >
              Database connection details are missing. Add your database host,
              name, username, and password to the installation configuration,
              then try again.
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
