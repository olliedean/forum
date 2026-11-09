import type { ReactNode } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { isForumConfigReady } from "@/lib/database/setup-state";

export default async function RequireForumConfig({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  if (!(await isForumConfigReady())) redirect("/init");
  return children;
}
