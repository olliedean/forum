import type { ReactNode } from "react";
import Category from "./Category";
import Sidebar from "./Sidebar";
import ParentCategory from "./ParentCategory";
import { FiSearch } from "react-icons/fi";
import { getHomepageData } from "@/lib/forum/data";

export default async function Home() {
  const data = await getHomepageData();
  const categoriesByParent = new Map<string | null, typeof data.categories>();
  const categoriesById = new Map(data.categories.map((category) => [category.id, category]));

  for (const category of data.categories) {
    const parentId =
      category.parentId && categoriesById.has(category.parentId) ? category.parentId : null;
    const children = categoriesByParent.get(parentId) ?? [];
    children.push(category);
    categoriesByParent.set(parentId, children);
  }

  const renderCategoryTree = (categoryId: string): ReactNode => {
    const category = categoriesById.get(categoryId);
    if (!category) return null;
    const children = categoriesByParent.get(category.id) ?? [];

    if (children.length === 0) return <Category key={category.id} category={category} />;
    return (
      <ParentCategory key={category.id} category={category}>
        {category.threadCount > 0 && <Category category={category} />}
        {children.map((child) => renderCategoryTree(child.id))}
      </ParentCategory>
    );
  };

  return (
      <div className="grid grid-cols-1 overflow-hidden rounded-b-xl border border-t-0 border-[#e5e7eb] bg-white shadow-xl md:grid-cols-[250px_minmax(0,1fr)]">
        <header className="col-span-full flex min-h-[92px] items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold leading-[34px] tracking-tight text-slate-700">
              {data.forumName}
            </h1>
            <p className="text-sm leading-5 text-slate-500">
              {data.registeredUsers.toLocaleString()} registered users have made{" "}
              {data.totalPosts.toLocaleString()} posts in {data.totalThreads.toLocaleString()} threads.
            </p>
          </div>
          <form
            action="#"
            role="search"
            className="hidden h-[38px] w-[270px] shrink-0 overflow-hidden rounded-md border border-slate-200 sm:flex"
          >
            <input
              aria-label="Search forums"
              placeholder="Search..."
              className="min-w-0 flex-1 px-3 text-[13px] outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex w-[42px] items-center justify-center bg-[#327db4] text-white transition-colors hover:bg-[#286a9b]"
            >
              <FiSearch className="size-4" />
            </button>
          </form>
        </header>
        <div className="order-2 bg-[#fafafa] md:order-1">
          <Sidebar data={data} />
        </div>
        <main className="order-1 min-w-0 md:order-2">
          {(categoriesByParent.get(null) ?? []).map((category) => renderCategoryTree(category.id))}
          {data.categories.length === 0 && (
            <p className="p-6 text-sm text-slate-500">No categories are available yet.</p>
          )}
        </main>
      </div>
  );
}
