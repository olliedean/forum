import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isForumConfigPresent } from "@/lib/database/setup-state";

const requestWindowMs = 60_000;
const maxAttemptsPerWindow = 8;
const attemptsByAddress = new Map<string, { count: number; resetAt: number }>();

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = (
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  )
    ?.split(",")[0]
    ?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol =
    forwardedProto?.split(",")[0]?.trim() ??
    request.nextUrl.protocol.replace(":", "");

  if (!origin || !host) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host && originUrl.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}

function isRateLimited(request: NextRequest) {
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const current = attemptsByAddress.get(address);

  if (!current || current.resetAt <= now) {
    attemptsByAddress.set(address, { count: 1, resetAt: now + requestWindowMs });
    return false;
  }

  current.count += 1;
  return current.count > maxAttemptsPerWindow;
}

async function setupIsEnabled() {
  if (
    process.env.NODE_ENV === "production" &&
    (process.env.FORUM_SETUP_ENABLED !== "true" || !process.env.FORUM_SETUP_TOKEN)
  ) {
    return false;
  }

  return !(await isForumConfigPresent());
}

function hasValidSetupToken(request: NextRequest) {
  const expected = process.env.FORUM_SETUP_TOKEN;
  if (!expected) return process.env.NODE_ENV !== "production";

  const provided = request.headers.get("x-forum-setup-token") ?? "";
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export async function authorizeSetupRequest(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!(await setupIsEnabled())) {
    return NextResponse.json(
      { error: "Forum setup is disabled." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Request origin could not be verified." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "Too many setup requests. Wait a minute and try again." },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!hasValidSetupToken(request)) {
    return NextResponse.json(
      { error: "Setup access token is invalid." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json." },
      { status: 415, headers: { "Cache-Control": "no-store" } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  return null;
}
