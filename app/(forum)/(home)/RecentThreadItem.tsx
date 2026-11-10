import Link from "next/link";
import { formatRelativeTime } from "@/lib/forum/format";

export default function RecentThreadItem({
  categorySlug,
  categoryName,
  publicId,
  title,
  createdAt,
  username,
}: {
  categorySlug: string;
  categoryName: string;
  publicId: string;
  title: string;
  createdAt: Date | string;
  userId: string | null;
  username: string | null;
}) {
  return (
    <li className="min-h-[55px] border-b border-slate-100 px-2 py-[9px] odd:bg-[#f7fbff]">
      <Link
        href={`/${categorySlug}/${publicId}`}
        className="block truncate text-[12px] leading-[17px] text-[#327db4]"
      >
        {title}
      </Link>
      <p className="truncate text-[11px] leading-[15px] text-[#777]">
        in {categoryName} · Posted by {username || "Deleted user"}
        <time dateTime={new Date(createdAt).toISOString()}>
          {formatRelativeTime(createdAt)}
        </time>
      </p>
    </li>
  );
}
