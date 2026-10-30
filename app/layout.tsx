import type { Metadata } from "next";
import { Suspense } from "react";
import { Rubik } from "next/font/google";
import "./globals.css";
import SiteHeader from "./_components/SiteHeader";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forum Name",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${rubik.variable} h-full antialiased`}>
      <body className="min-h-full bg-transparent font-sans text-foreground">
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
      </body>
    </html>
  );
}
