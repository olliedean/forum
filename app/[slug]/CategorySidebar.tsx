export default function CategorySidebar() {
  return (
    <aside className="border-r border-slate-200">
      <h2 className="min-h-[39px] border-b border-slate-200 bg-slate-50 px-3 py-[10px] text-xs font-normal text-slate-500">
        Statistics
      </h2>
      <dl className="space-y-0 px-3 py-3 text-xs leading-5">
        <div className="flex justify-between gap-2">
          <dt>Posts</dt>
          <dd className="min-w-[90px] text-right">
            <span className="mr-1 text-[10px] text-emerald-600">(+0)</span>
            0
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Threads</dt>
          <dd className="min-w-[90px] text-right">
            <span className="mr-1 text-[10px] text-emerald-600">(+0)</span>
            0
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Ratings</dt>
          <dd className="min-w-[90px] text-right">
            <span className="mr-1 text-[10px] text-emerald-600">(+0)</span>
            0
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Subscriptions</dt>
          <dd className="min-w-[90px] text-right">
            <span className="mr-1 text-[10px] text-emerald-600">(+0)</span>
            0
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Users Here</dt>
          <dd>0</dd>
        </div>
      </dl>
    </aside>
  );
}
