import type { NextRequest } from "next/server";

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const originValue = origin ?? referer;
  if (!originValue) return false;

  try {
    const originUrl = new URL(originValue);
    if (origin && originUrl.origin === "null") return false;
    if (originUrl.protocol !== "http:" && originUrl.protocol !== "https:") return false;

    const requestHosts = [
      ...(request.headers.get("x-forwarded-host")?.split(",") ?? []),
      request.headers.get("host") ?? "",
      request.nextUrl.host,
    ];

    const matchesRequestHost = requestHosts.some((value) => {
      const host = value.trim();
      if (!host) return false;
      try {
        return new URL(`${originUrl.protocol}//${host}`).host.toLowerCase() ===
          originUrl.host.toLowerCase();
      } catch {
        return false;
      }
    });
    if (matchesRequestHost) return true;

    if (!origin || request.headers.get("sec-fetch-site") !== "same-origin") {
      return false;
    }

    return !referer || new URL(referer).origin === originUrl.origin;
  } catch {
    return false;
  }
}
