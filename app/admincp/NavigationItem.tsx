import Link from "next/link";
import type { IconType } from "react-icons";

type NavigationItemProps = {
  icon: IconType;
  label: string;
  href: string;
  badge?: string;
};

export default function NavigationItem({
  icon: Icon,
  label,
  href,
  badge,
}: NavigationItemProps) {
  const isActive = href === "/admincp";

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center justify-between rounded px-2.5 py-1.5 transition-colors ${
        isActive
          ? "bg-[#edf2f7] font-semibold text-[#111827]"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
      href={href}
    >
      <span className="flex items-center gap-2">
        <Icon
          aria-hidden="true"
          className={`text-[14px] ${
            isActive ? "text-blue-600" : badge ? "text-[#eb3b5a]" : ""
          }`}
        />
        <span>{label}</span>
      </span>
      {badge && (
        <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-700">
          {badge}
        </span>
      )}
    </Link>
  );
}
