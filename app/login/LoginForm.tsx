"use client";

import { useState } from "react";

type AuthMode = "login" | "register";

export default function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const isRegistering = mode === "register";

  return (
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

      <form action="#" className="p-4 sm:p-6">
        {isRegistering && (
          <div className="mb-4">
            <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-slate-600">
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
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
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#327db4]"
            />
          </div>
        )}

        {!isRegistering && (
          <label className="mb-5 flex items-center gap-2 text-xs text-slate-500">
            <input type="checkbox" name="remember" className="accent-[#327db4]" />
            Keep me logged in
          </label>
        )}

        <button
          type="submit"
          className="rounded-sm border border-[#286a9b] bg-[#327db4] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#286a9b]"
        >
          {isRegistering ? "Create account" : "Login"}
        </button>
      </form>
    </>
  );
}
