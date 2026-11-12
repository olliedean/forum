import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getThreadMetadata, getThreadPageData, parsePage } from "@/lib/forum/data";
import { formatRelativeTime } from "@/lib/forum/format";
import { sanitizePostHtml } from "@/lib/forum/post-body";
import { ReplyToPostButton, ThreadReplies } from "./ThreadReplies";
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
  const [{ slug, thread: publicId }, query, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);
  const data = await getThreadPageData(slug, publicId, parsePage(query.page));
  if (!data) notFound();
  const canReply = Boolean(user);

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
      <ThreadReplies
        categorySlug={data.category.slug}
        threadPublicId={data.thread.publicId}
        canReply={canReply}
      >
        <section aria-label="Posts">
          {data.posts.map((post) => {
            const safeBody =
              post.bodyFormat === "html"
                ? sanitizePostHtml(post.body)
                : `<p>${post.body
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;")
                    .replace(/\r?\n/g, "<br>")}</p>`;
            const author = post.authorName ?? "Deleted user";
            const quotedHTML = `<blockquote><p><strong>${author
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;")} wrote:</strong></p>${safeBody}</blockquote><p></p>`;

            return (
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
                  {post.bodyFormat === "html" ? (
                    <div
                      className="min-w-0 break-words p-4 text-sm leading-6 text-slate-700 [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:font-mono [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_pre]:my-3 [&_pre]:block [&_pre]:overflow-x-auto [&_pre]:rounded-sm [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:text-slate-100 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:px-2 [&_th]:py-1.5 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-[#286a9b] [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: safeBody }}
                    />
                  ) : (
                    <div className="min-w-0 whitespace-pre-wrap break-words p-4 text-sm leading-6 text-slate-700">
                      {post.body}
                    </div>
                  )}
                </div>
                {canReply ? (
                  <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-4 py-2">
                    <ReplyToPostButton quotedHTML={quotedHTML} />
                  </footer>
                ) : null}
              </article>
            );
          })}
          {data.posts.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              This thread has no visible posts.
            </p>
          )}
        </section>
      </ThreadReplies>
      <ThreadPagination {...paginationProps} />
      </div>
  );
}
