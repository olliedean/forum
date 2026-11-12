import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { readForumConfig } from "@/lib/database/config";
import { createKnexClient } from "@/lib/database/connection";

type NewThreadRouteProps = {
  params: Promise<{ slug: string }>;
};

function stripHtmlForValidation(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(
  request: NextRequest,
  { params }: NewThreadRouteProps,
) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const rawBody = String(formData.get("body") ?? "");
  const bodyText = stripHtmlForValidation(rawBody);

  if (!title || title.length > 200 || !bodyText || bodyText.length > 50_000) {
    const redirectUrl = new URL(`/${slug}/new`, request.url);
    redirectUrl.searchParams.set("error", "Thread title and message are required.");
    return NextResponse.redirect(redirectUrl);
  }

  const config = await readForumConfig();
  const database = createKnexClient(config.database, config.migrationTableName);

  try {
    const category = await database("categories")
      .select("id", "slug")
      .where({ slug, is_visible: true })
      .first();

    if (!category) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const publicId = globalThis.crypto.randomUUID();

    await database.transaction(async (transaction) => {
      await transaction("threads").insert({
        public_id: publicId,
        category_id: category.id,
        user_id: user.id,
        title,
      });

      const thread = await transaction("threads")
        .where({ public_id: publicId })
        .first("id");

      if (!thread) {
        throw new Error("Failed to create thread.");
      }

      await transaction("posts").insert({
        thread_id: thread.id,
        user_id: user.id,
        body: rawBody,
        body_format: "html",
      });
    });

    return NextResponse.redirect(new URL(`/${category.slug}/${publicId}`, request.url));
  } catch (error) {
    console.error("Could not create forum thread.", error);
    const redirectUrl = new URL(`/${slug}/new`, request.url);
    redirectUrl.searchParams.set(
      "error",
      "We could not create that thread. Please try again.",
    );
    return NextResponse.redirect(redirectUrl);
  } finally {
    await database.destroy();
  }
}
