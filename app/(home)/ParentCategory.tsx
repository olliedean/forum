import Category from "./Category";

export default function ParentCategory() {
  return (
    <section>
      <header className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h2 className="text-[15px] font-bold text-slate-600">Lorem ipsum</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </header>
      {Array.from({ length: 6 }, (_, index) => <Category key={index} />)}
    </section>
  );
}
