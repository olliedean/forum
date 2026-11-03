import { Suspense, type ReactNode } from "react";
import SiteHeader from "../_components/SiteHeader";

export default function ForumLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed px-0 text-[#555] sm:px-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(40, 52, 62, .42), rgba(40, 52, 62, .42)), url('/bg.png')",
      }}
    >
      <div className="mx-auto max-w-[1280px] pb-8">
        <Suspense
          fallback={
            <div className="relative z-10 h-[90px] rounded-t-xl border border-[#e5e7eb] bg-white shadow-sm" />
          }
        >
          <SiteHeader />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
