import ParentCategory from "./ParentCategory";
import Sidebar from "./Sidebar";

export default function Home() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-b-xl border border-t-0 border-[#e5e7eb] bg-white shadow-xl md:grid-cols-[250px_minmax(0,1fr)]">
      <div className="order-2 bg-[#fafafa] md:order-1">
        <Sidebar />
      </div>
      <main className="order-1 min-w-0 md:order-2">
        {Array.from({ length: 2 }, (_, index) => (
          <ParentCategory key={index} />
        ))}
      </main>
    </div>
  );
}
