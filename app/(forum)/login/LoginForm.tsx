"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import { isAuthUser, useAuthSession } from "@/app/_components/useAuthSession";

type AuthMode = "login" | "register";

export default function LoginForm() {
  const router = useRouter();
  const {
    user,
    isLoading: checkingSession,
    error: sessionError,
    acceptUser,
  } = useAuthSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const isRegistering = mode === "register";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    let destination = "/";
    try {
      const previousPage = new URL(document.referrer);
      if (
        previousPage.origin === window.location.origin &&
        !/^\/login(?:\/|$)/.test(previousPage.pathname)
      ) {
        destination = `${previousPage.pathname}${previousPage.search}${previousPage.hash}`;
      }
    } catch {
      // Direct visits and invalid referrers fall back to the forum home page.
    }

    router.replace(destination);
  }, [router, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password");
    const email = formData.get("email");
    if (typeof email !== "string" || typeof password !== "string") {
      setError("Enter your email address and password.");
      return;
    }

    const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegistering
      ? {
          username: formData.get("username"),
          email,
          password,
          confirmPassword: formData.get("confirmPassword"),
        }
      : {
          email,
          password,
          remember: formData.get("remember") === "on",
        };

    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
            ? result.error
            : isRegistering
              ? "Could not create your account."
              : "Could not sign in.",
        );
      }
      if (
        typeof result !== "object" ||
        result === null ||
        !("user" in result) ||
        !isAuthUser(result.user)
      ) {
        throw new Error("The server returned an invalid account response.");
      }

      acceptUser(result.user);
      form.reset();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Account request failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {checkingSession ? (
        <p className="p-6 text-sm text-slate-500" role="status">
          Checking your session...
        </p>
      ) : !user ? (
        <>
      <div className="flex border-b border-slate-200 bg-slate-50" role="tablist" aria-label="Account options">
        <button
          type="button"
          role="tab"
          aria-selected={!isRegistering}
          onClick={() => setMode("login")}
          className={`border-r border-slate-200 px-5 py-3 text-xs ${
            !isRegistering
              ? "border-b-2 border-b-[#327db4] bg-white font-medium text-[#327db4]"
              : "text-slate-500 hover:bg-white"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isRegistering}
          onClick={() => setMode("register")}
          className={`border-r border-slate-200 px-5 py-3 text-xs ${
            isRegistering
              ? "border-b-2 border-b-[#327db4] bg-white font-medium text-[#327db4]"
              : "text-slate-500 hover:bg-white"
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={submit} className="p-4 sm:p-6">
        {isRegistering && (
          <div className="mb-4">
            <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-slate-600">
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              maxLength={32}
              required
              className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#327db4]"
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-600">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#327db4]"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-600">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegistering ? "new-password" : "current-password"}
            minLength={isRegistering ? 8 : undefined}
            maxLength={1024}
            required
            className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#327db4]"
          />
        </div>

        {isRegistering && (
          <div className="mb-4">
            <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-medium text-slate-600">
              Confirm password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={1024}
              required
              className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#327db4]"
            />
          </div>
        )}

        {!isRegistering && (
          <label className="mb-5 flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              name="remember"
              className="accent-[#327db4]"
            />
            Keep me logged in
          </label>
        )}

        {(error || sessionError) && (
          <p className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
            {error || sessionError}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-sm border border-[#286a9b] bg-[#327db4] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#286a9b] disabled:cursor-wait disabled:opacity-60"
        >
          {submitting && <FiLoader className="animate-spin" aria-hidden="true" />}
          {isRegistering ? "Create account" : "Login"}
        </button>
      </form>
        </>
      ) : null}
    </>
  );
}
