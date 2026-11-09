import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import RequireForumConfig from "@/app/_components/RequireForumConfig";
import RequireAdmin from "@/app/_components/RequireAdmin";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

const inter = Inter({
  variable: "--font-admin-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-admin-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forum AdminCP",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f5f7]" />}>
      <RequireForumConfig>
        <RequireAdmin>
          <div
            className={`${inter.variable} ${jetBrainsMono.variable} admincp-shell min-h-screen bg-[#f4f5f7] text-[13px] leading-snug text-[#1e2329]`}
          >
            <AdminHeader />
            <div className="flex min-h-screen pt-12">
              <AdminSidebar />
              <main className="ml-56 min-h-[calc(100vh-3rem)] max-w-[1380px] flex-1 p-5">
                {children}
              </main>
            </div>
          </div>
        </RequireAdmin>
      </RequireForumConfig>
    </Suspense>
  );
}
