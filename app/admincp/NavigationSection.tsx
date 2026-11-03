import type { ReactNode } from "react";

type NavigationSectionProps = {
  title: string;
  children: ReactNode;
};

export default function NavigationSection({
  title,
  children,
}: NavigationSectionProps) {
  return (
    <section>
      <h2 className="mb-1.5 px-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
        {title}
      </h2>
      <nav
        aria-label={title}
        className="space-y-0.5 text-xs font-medium"
      >
        {children}
      </nav>
    </section>
  );
}
