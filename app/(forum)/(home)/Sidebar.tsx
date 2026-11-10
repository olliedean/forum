import RecentThreadItem from "./RecentThreadItem";
import type { HomepageData } from "@/lib/forum/data";

export default function Sidebar({ data }: { data: HomepageData }) {
  return (
    <aside className="border-r border-[#e5e7eb]">
      <section>
        <h2 className="min-h-[39px] border-b border-slate-200 bg-slate-50 px-2 py-[10px] text-xs font-normal text-[#888]">
          Latest Threads
        </h2>
        <ul>
          {data.latestThreads.map((thread) => (
            <RecentThreadItem key={thread.publicId} {...thread} />
          ))}
          {data.latestThreads.length === 0 && (
            <li className="px-3 py-4 text-xs text-slate-500">No threads yet.</li>
          )}
        </ul>
      </section>
      <section>
        <h2 className="min-h-[39px] border-b border-slate-200 bg-slate-50 px-2 py-[10px] text-xs font-normal text-[#888]">
          Statistics
        </h2>
        <dl className="space-y-0 px-3 py-3 text-[12px] leading-5">
            <div className="flex justify-between gap-2">
              <dt>Registered Users</dt>
              <dd>{data.registeredUsers}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Posts</dt>
              <dd>{data.totalPosts}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Threads</dt>
              <dd>{data.totalThreads}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Ratings</dt>
              <dd>
                <span className="mr-1 text-[10px] text-emerald-600">(+0)</span>0
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Online Users</dt>
              <dd>0</dd>
            </div>
        </dl>
      </section>
    </aside>
  );
}
