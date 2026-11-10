import { NextRequest, NextResponse } from "next/server";
import { getForumBreadcrumbs } from "@/lib/forum/data";

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("path");
  if (!pathname || !pathname.startsWith("/") || pathname.length > 2_048) {
    return NextResponse.json(
      { error: "A valid page path is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const items = await getForumBreadcrumbs(pathname);
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Could not load forum breadcrumbs.", error);
    return NextResponse.json(
      { error: "Could not load navigation breadcrumbs." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
