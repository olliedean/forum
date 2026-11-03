import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login / Join - Forum",
  description: "Sign in or create a forum account.",
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-122px)] rounded-b-xl border border-t-0 border-slate-200 bg-white px-4 py-8 shadow-xl sm:px-6">
      <section className="mx-auto w-full max-w-[640px] overflow-hidden rounded-b-md border border-slate-200 bg-white">
        <LoginForm />
      </section>
    </main>
  );
}
