import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { isForumConfigPresent } from "@/lib/database/setup-state";
import InitWizard from "./InitWizard";

export const metadata: Metadata = {
  title: "Forum Installation",
  description: "Configure your forum and administrator account.",
};

async function InitContent() {
  await connection();
  if (await isForumConfigPresent()) redirect("/");
  else return <InitWizard setupTokenRequired={Boolean(process.env.FORUM_SETUP_TOKEN)} />;
}

export default function InitPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f4f5f7] px-4 py-8 sm:py-12">
          <div className="mx-auto h-[450px] max-w-[920px] animate-pulse rounded-md border border-slate-200 bg-white" />
        </main>
      }
    >
      <InitContent />
    </Suspense>
  );
}
