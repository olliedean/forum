import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getThreadMetadata, getThreadPageData, parsePage } from "@/lib/forum/data";
import { formatRelativeTime } from "@/lib/forum/format";
import ThreadPagination from "../ThreadPagination";

type ThreadPageProps = {
  params: Promise<{ slug: string; thread: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: ThreadPageProps): Promise<Metadata> {
  const { slug, thread } = await params;
  const data = await getThreadMetadata(slug, thread);
  if (!data) return { title: "Thread not found - Forum" };
  return {
    title: `${data.title} - ${data.categoryName} - Forum`,
    description: `Posts in ${data.title}.`,
  };
}

export default async function ThreadPage({ params, searchParams }: ThreadPageProps) {
  const [{ slug, thread: publicId }, query] = await Promise.all([params, searchParams]);
  const data = await getThreadPageData(slug, publicId, parsePage(query.page));
  if (!data) notFound();

  const hrefForPage = (page: number) =>
    page === 1
      ? `/${data.category.slug}/${data.thread.publicId}`
      : `/${data.category.slug}/${data.thread.publicId}?page=${page}`;
  const paginationProps = {
    currentPage: data.page,
    totalPages: data.pageCount,
    hrefForPage,
    label: "Post",
  };
  return (
      <div className="overflow-hidden rounded-b-xl border border-t-0 border-slate-200 bg-white shadow-xl">
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold leading-8 text-slate-700">
            {data.thread.title}
          </h1>
          <p className="text-sm text-slate-500">
            {Math.max(data.postCount - 1, 0)} replies · Posted by{" "}
            {data.thread.authorId && data.thread.authorName ? (
              <>
                <Link
                  href={`/u/${encodeURIComponent(data.thread.authorId)}`}
                  className="font-medium text-[#327db4] hover:underline"
                >
                  {data.thread.authorName}
                </Link>{" "}
              </>
            ) : (
              <span className="font-medium text-slate-700">Deleted user</span>
            )}{" "}
            <time dateTime={new Date(data.thread.createdAt).toISOString()}>
              {formatRelativeTime(data.thread.createdAt)}
            </time>
            <span className="ml-2">{data.thread.viewsCount} views</span>
          </p>
        </div>
      </header>
      <ThreadPagination {...paginationProps} />
      <section aria-label="Posts">
        {data.posts.map((post) => (
          <article key={post.id} className="border-b border-slate-200 last:border-b-0">
            <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-y border-slate-200 bg-gray-100 px-3 py-2 text-xs text-slate-600">
              <span>
                Posted by{" "}
                {post.authorId && post.authorName ? (
                  <>
                    <Link
                      href={`/u/${encodeURIComponent(post.authorId)}`}
                      className="font-medium text-[#327db4] hover:underline"
                    >
                      {post.authorName}
                    </Link>{" "}
                  </>
                ) : (
                  <span className="font-medium">Deleted user</span>
                )}{" "}
                <time dateTime={new Date(post.createdAt).toISOString()}>
                  {formatRelativeTime(post.createdAt)}
                </time>
              </span>
            </header>
            <div className="grid min-h-48 grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
              <aside className="border-b border-slate-200 bg-slate-50 p-4 md:border-b-0 md:border-r">
                {post.authorId && post.authorName ? (
                  <Link
                    href={`/u/${encodeURIComponent(post.authorId)}`}
                    className="font-semibold text-[#327db4] hover:underline"
                  >
                    {post.authorName}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-600">Deleted user</span>
                )}
              </aside>
              <div className="min-w-0 whitespace-pre-wrap break-words p-4 text-sm leading-6 text-slate-700">
                {post.body}
              </div>
            </div>
          </article>
        ))}
        {data.posts.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            This thread has no visible posts.
          </p>
        )}
      </section>
      <ThreadPagination {...paginationProps} />
      </div>
  );
}
