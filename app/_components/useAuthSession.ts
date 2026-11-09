"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

export function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "username" in value &&
    typeof value.username === "string" &&
    "email" in value &&
    typeof value.email === "string"
  );
}

function getResponseError(value: unknown, fallback: string): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }
  return fallback;
}

export function useAuthSession() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkedPathname, setCheckedPathname] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const isLoading = checkedPathname !== pathname;

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        const result: unknown = await response.json();
        if (!response.ok) {
          throw new Error(getResponseError(result, "Could not check the current session."));
        }
        if (
          typeof result !== "object" ||
          result === null ||
          !("user" in result) ||
          (result.user !== null && !isAuthUser(result.user))
        ) {
          throw new Error("The server returned an invalid session response.");
        }
        if (active) {
          setUser(result.user);
          setError("");
        }
      })
      .catch((failure: unknown) => {
        if (active) {
          setUser(null);
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not check the current session.",
          );
          console.error("Could not check the current forum session.", failure);
        }
      })
      .finally(() => {
        if (active) setCheckedPathname(pathname);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  const acceptUser = useCallback((authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setError("");
  }, []);

  const signOut = useCallback(async () => {
    if (signingOut) return false;
    setSigningOut(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(getResponseError(result, "Could not sign out."));
      }

      setUser(null);
      return true;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not sign out.");
      return false;
    } finally {
      setSigningOut(false);
    }
  }, [signingOut]);

  return {
    user,
    isLoading,
    error,
    signingOut,
    acceptUser,
    signOut,
  };
}
