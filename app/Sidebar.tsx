import RecentThreadItem from "./RecentThreadItem";

export default function Sidebar() {
  return (
    <aside className="border-r border-[#e5e7eb]">
      <section>
        <h2 className="min-h-[39px] border-b border-slate-200 bg-slate-50 px-2 py-[10px] text-xs font-normal text-[#888]">
          Latest Threads
        </h2>
        <ul>
          {Array.from({ length: 10 }, (_, index) => (
            <RecentThreadItem key={index} />
          ))}
        </ul>
      </section>
      <section>
        <h2 className="min-h-[39px] border-b border-slate-200 bg-slate-50 px-2 py-[10px] text-xs font-normal text-[#888]">
          Statistics
        </h2>
        <dl className="space-y-0 px-3 py-3 text-[12px] leading-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex justify-between gap-2">
              <span>Lorem ipsum</span>
              <span><span className="mr-1 text-[10px] text-emerald-600">(+0)</span>0</span>
            </div>
          ))}
        </dl>
      </section>
    </aside>
  );
}
