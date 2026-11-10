import Link from "next/link";
import { FiMessageSquare } from "react-icons/fi";
import type { CategorySummary } from "@/lib/forum/data";
import { formatRelativeTime } from "@/lib/forum/format";

export default function Category({ category }: { category: CategorySummary }) {
  const latest = category.latestActivity;

  return (
    <article className="grid min-h-[58px] grid-cols-[44px_minmax(0,1fr)_56px_56px] border-b border-slate-200 bg-white transition-colors hover:bg-[#f8fbff] lg:grid-cols-[48px_minmax(0,1fr)_190px_68px_68px]">
      <div className="flex items-center justify-center text-slate-700">
        <FiMessageSquare aria-hidden="true" className="size-6 stroke-[1.8]" />
      </div>
      <div className="min-w-0 self-center py-2 pr-2">
        <div className="truncate leading-5">
          <Link className="text-base font-bold text-[#327db4] hover:underline" href={`/${category.slug}`}>
            {category.name}
          </Link>
        </div>
        <p className="mt-0.5 truncate text-[11px] leading-[15px] text-[#666]">
          {category.description || "No description"}
        </p>
      </div>
      <div className="hidden min-w-0 self-stretch border-l border-[#dce4eb] bg-[#f7fbff] px-2 py-1 text-right lg:flex lg:flex-col lg:justify-center">
        {latest ? (
          <>
            <Link
              className="truncate text-[11px] font-medium leading-[15px] text-[#327db4]"
              href={`/${category.slug}/${latest.threadPublicId}`}
            >
              {latest.threadTitle}
            </Link>
            <p className="truncate text-[11px] leading-[15px] text-[#777]">
              Posted by{" "}
              {latest.username && latest.userId ? (
                <Link href={`/u/${encodeURIComponent(latest.userId)}`} className="text-[#327db4] underline">
                  {latest.username}
                </Link>
              ) : (
                <span>Deleted user</span>
              )}
              {" "}({latest.userId ?? "—"}) ·{" "}
              <time dateTime={new Date(latest.createdAt).toISOString()}>
                {formatRelativeTime(latest.createdAt)}
              </time>
            </p>
          </>
        ) : (
          <span className="text-[11px] text-slate-400">No posts yet</span>
        )}
      </div>
      <div className="flex flex-col items-center justify-center border-x border-slate-200 bg-slate-50 text-center">
        <strong className="text-base leading-[19px] text-[#666]">{category.threadCount}</strong>
        <span className="text-[11px] leading-[14px] text-[#aaa]">threads</span>
      </div>
      <div className="flex flex-col items-center justify-center border-r border-slate-200 bg-slate-50 text-center">
        <strong className="text-base leading-[19px] text-[#666]">{category.postCount}</strong>
        <span className="text-[11px] leading-[14px] text-[#aaa]">posts</span>
      </div>
    </article>
  );
}
