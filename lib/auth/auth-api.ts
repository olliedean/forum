import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "./session";

const requestWindowMs = 60_000;
const maxAttemptsPerWindow = 10;
const maxBodyBytes = 8_192;
const attemptsByAddress = new Map<string, { count: number; resetAt: number }>();

export class AuthRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function noStoreJson(
  body: unknown,
  init?: ResponseInit,
): NextResponse {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, { ...init, headers });
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = (
    request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  )
    ?.split(",")[0]
    ?.trim();
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    request.nextUrl.protocol.replace(":", "");
  if (!origin || !host) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host && originUrl.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}

function isRateLimited(request: NextRequest): boolean {
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const current = attemptsByAddress.get(address);

  if (!current || current.resetAt <= now) {
    attemptsByAddress.set(address, { count: 1, resetAt: now + requestWindowMs });
    return false;
  }

  current.count += 1;
  if (attemptsByAddress.size > 1_000) {
    for (const [key, attempt] of attemptsByAddress) {
      if (attempt.resetAt <= now) attemptsByAddress.delete(key);
    }
  }
  return current.count > maxAttemptsPerWindow;
}

export function authorizeAuthMutation(request: NextRequest): NextResponse | null {
  if (!isSameOrigin(request)) {
    return noStoreJson({ error: "Request origin could not be verified." }, { status: 403 });
  }
  if (isRateLimited(request)) {
    return noStoreJson(
      { error: "Too many account requests. Wait a minute and try again." },
      { status: 429 },
    );
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return noStoreJson(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBodyBytes) {
    return noStoreJson({ error: "Request body is too large." }, { status: 413 });
  }
  return null;
}

export async function readAuthJson(request: NextRequest): Promise<unknown> {
  if (!request.body) {
    throw new AuthRequestError("Request body must be valid JSON.", 400);
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBodyBytes) {
        await reader.cancel();
        throw new AuthRequestError("Request body is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  try {
    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(body));
  } catch (error) {
    if (error instanceof AuthRequestError) throw error;
    throw new AuthRequestError("Request body must be valid JSON.", 400);
  }
}

export function setSessionCookie(
  response: NextResponse,
  session: { token: string; expiresAt: Date; remember: boolean },
): void {
  response.cookies.set({
    name: sessionCookieName,
    value: session.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(session.remember ? { expires: session.expiresAt } : {}),
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: sessionCookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export function getPayloadRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AuthRequestError("Request body must be an object.", 400);
  }
  return value as Record<string, unknown>;
}
