import type { ReactNode } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function RequireAdmin({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.ranks.includes("admin")) redirect("/");
  return children;
}
