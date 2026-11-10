import type { ReactNode } from "react";
import type { CategorySummary } from "@/lib/forum/data";

export default function ParentCategory({
  category,
  children,
}: {
  category: CategorySummary;
  children: ReactNode;
}) {
  return (
    <section>
      <header className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h2 className="text-[15px] font-bold text-slate-600">{category.name}</h2>
        {category.description && (
          <p className="mt-0.5 text-xs text-slate-500">{category.description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
