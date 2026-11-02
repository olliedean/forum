import { Suspense } from "react";
import type { Metadata } from "next";

type UserProfilePageProps = {
  params: Promise<{ uid: string }>;
};

export async function generateMetadata({
  params,
}: UserProfilePageProps): Promise<Metadata> {
  const { uid } = await params;

  return {
    title: `ollie - Profile - Forum`,
    description: `Forum profile for ${uid}.`,
  };
}

async function UserProfile({ params }: UserProfilePageProps) {
  const { uid } = await params;

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-b-xl border border-t-0 border-slate-200 bg-white shadow-xl md:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="order-2 border-b border-slate-200 bg-slate-50 md:order-1 md:border-b-0 md:border-r">
        <h2 className="min-h-[39px] border-b border-slate-200 bg-slate-50 px-3 py-[10px] text-xs font-normal text-slate-500">
          Profile Statistics
        </h2>
        <dl className="space-y-0 px-3 py-3 text-xs leading-5">
          <div className="flex justify-between gap-2">
            <dt>Threads</dt>
            <dd>0</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Posts</dt>
            <dd>0</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Level</dt>
            <dd>1</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Joined</dt>
            <dd>2026</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Last seen</dt>
            <dd>2026</dd>
          </div>
        </dl>
      </aside>

      <main className="order-1 min-w-0 md:order-2">
        user bio something something
      </main>
    </div>
  );
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-96 grid-cols-1 rounded-b-xl border border-t-0 border-slate-200 bg-white shadow-xl md:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden border-r border-slate-200 bg-slate-50 md:block" />
          <main className="animate-pulse p-6">
            <div className="h-16 w-64 rounded bg-slate-100" />
            <div className="mt-6 h-10 rounded bg-slate-50" />
            <div className="mt-6 h-32 rounded bg-slate-50" />
          </main>
        </div>
      }
    >
      <UserProfile params={params} />
    </Suspense>
  );
}
