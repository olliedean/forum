import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createKnexClient } from "@/lib/database/connection";
import { readForumConfig } from "@/lib/database/config";
import { isSameOriginRequest } from "@/lib/http/same-origin";
import { sanitizePostHtml } from "@/lib/forum/post-body";

const maxRequestBytes = 256_000;
const maxPostLength = 50_000;

type CreatePostRouteProps = {
  params: Promise<{ slug: string; thread: string }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

async function readJsonBody(request: NextRequest): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxRequestBytes) {
    throw new Error("The reply is too large.");
  }

  if (!request.body) {
    throw new Error("A reply body is required.");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxRequestBytes) {
        await reader.cancel();
        throw new Error("The reply is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error("The reply request is invalid.");
  }
}

function getPostBody(value: unknown): string {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("body" in value) ||
    typeof value.body !== "string"
  ) {
    throw new Error("A reply message is required.");
  }

  const body = sanitizePostHtml(value.body);
  const text = body
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if ((!text && !/<img\b/i.test(body)) || body.length > maxPostLength) {
    throw new Error("Enter a reply of no more than 50,000 characters.");
  }
  return body;
}

export async function POST(
  request: NextRequest,
  { params }: CreatePostRouteProps,
) {
  if (!isSameOriginRequest(request)) {
    return jsonError("Request origin could not be verified.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to post a reply.", 401);
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonError("Content-Type must be application/json.", 415);
  }

  let body: string;
  try {
    body = getPostBody(await readJsonBody(request));
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "The reply request is invalid.",
      400,
    );
  }

  const { slug, thread: publicId } = await params;
  const config = await readForumConfig();
  const database = createKnexClient(config.database, config.migrationTableName);

  try {
    const thread = await database("threads")
      .join("categories", "threads.category_id", "categories.id")
      .select("threads.id", "threads.is_locked")
      .where({
        "categories.slug": slug,
        "categories.is_visible": true,
        "threads.public_id": publicId,
      })
      .first();

    if (!thread) return jsonError("Thread not found.", 404);
    if (thread.is_locked) return jsonError("This thread is locked.", 403);

    await database.transaction(async (transaction) => {
      await transaction("posts").insert({
        thread_id: thread.id,
        user_id: user.id,
        body,
        body_format: "html",
      });
      await transaction("threads")
        .where({ id: thread.id })
        .update({ updated_at: new Date() });
    });

    return NextResponse.json(
      { success: true },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Could not create forum reply.", error);
    return jsonError("Could not post your reply. Please try again.", 503);
  } finally {
    await database.destroy();
  }
}
