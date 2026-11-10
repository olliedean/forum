import "server-only";

import { cache } from "react";
import type { Knex } from "knex";
import { readForumConfig } from "@/lib/database/config";
import { createKnexClient } from "@/lib/database/connection";

const categoryPageSize = 20;
const postPageSize = 20;

type CategoryRow = {
  id: string | number;
  parent_id: string | number | null;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_visible: boolean;
};

type CategoryActivity = {
  category_id: string | number;
  thread_public_id: string;
  thread_title: string;
  created_at: Date | string;
  user_id: string | number | null;
  username: string | null;
};

type CountRow = {
  category_id: string | number;
  count?: string | number;
};

type ThreadPostCountRow = {
  thread_id: string | number;
  count?: string | number;
};

type ThreadActivityRow = {
  id: string | number;
  latest_post_at: Date | string | null;
  latest_post_author_id: string | number | null;
  latest_post_author_name: string | null;
};

export type CategorySummary = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string;
  threadCount: number;
  postCount: number;
  latestActivity: {
    threadPublicId: string;
    threadTitle: string;
    createdAt: Date | string;
    userId: string | null;
    username: string | null;
  } | null;
};

export type HomepageData = {
  forumName: string;
  registeredUsers: number;
  totalPosts: number;
  totalThreads: number;
  categories: CategorySummary[];
  latestThreads: Array<{
    categorySlug: string;
    categoryName: string;
    publicId: string;
    title: string;
    createdAt: Date | string;
    userId: string | null;
    username: string | null;
  }>;
};

export type CategoryThread = {
  publicId: string;
  title: string;
  viewsCount: number;
  postCount: number;
  createdAt: Date | string;
  latestPostAt: Date | string | null;
  authorId: string | null;
  authorName: string | null;
  latestPostAuthorId: string | null;
  latestPostAuthorName: string | null;
};

export type CategoryPageData = {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    threadCount: number;
    postCount: number;
  };
  threads: CategoryThread[];
  page: number;
  pageCount: number;
};

export type ThreadPost = {
  id: string;
  body: string;
  bodyFormat: string;
  createdAt: Date | string;
  authorId: string | null;
  authorName: string | null;
};

export type ThreadPageData = {
  category: { name: string; slug: string };
  thread: {
    id: string;
    publicId: string;
    title: string;
    viewsCount: number;
    createdAt: Date | string;
    authorId: string | null;
    authorName: string | null;
  };
  posts: ThreadPost[];
  postCount: number;
  page: number;
  pageCount: number;
};

export type ThreadMetadata = {
  categoryName: string;
  categorySlug: string;
  title: string;
} | null;

export type CategoryMetadata = {
  name: string;
  description: string;
} | null;

async function withForumDatabase<T>(
  callback: (database: Knex, forumName: string) => Promise<T>,
): Promise<T> {
  const config = await readForumConfig();
  const database = createKnexClient(config.database, config.migrationTableName);
  try {
    return await callback(database, config.forum?.name || "Forum");
  } finally {
    await database.destroy();
  }
}

function toCount(value: unknown): number {
  const count = Number(value ?? 0);
  return Number.isFinite(count) ? count : 0;
}

function toId(value: string | number | null | undefined): string | null {
  return value == null ? null : String(value);
}

function normalizePage(value: number, pageCount: number): number {
  if (!Number.isSafeInteger(value) || value < 1) return 1;
  return Math.min(value, Math.max(pageCount, 1));
}

export const getHomepageData = cache(async (): Promise<HomepageData> =>
  withForumDatabase(async (database, forumName) => {
    const [categories, threadCounts, postCounts, userCount, totalPostCount, totalThreadCount] =
      await Promise.all([
        database<CategoryRow>("categories")
          .select("id", "parent_id", "name", "slug", "description", "sort_order", "is_visible")
          .where({ is_visible: true })
          .orderBy("sort_order", "asc")
          .orderBy("id", "asc"),
        database("threads")
          .join("categories", "threads.category_id", "categories.id")
          .where({ "categories.is_visible": true })
          .select<CountRow[]>("threads.category_id")
          .select(database.raw("COUNT(??) AS ??", ["threads.id", "count"]))
          .groupBy("threads.category_id"),
        database("posts")
          .join("threads", "posts.thread_id", "threads.id")
          .join("categories", "threads.category_id", "categories.id")
          .where({ "categories.is_visible": true })
          .whereNull("posts.deleted_at")
          .select<CountRow[]>("threads.category_id")
          .select(database.raw("COUNT(??) AS ??", ["posts.id", "count"]))
          .groupBy("threads.category_id"),
        database("users").count({ count: "id" }).first(),
        database("posts").whereNull("deleted_at").count({ count: "id" }).first(),
        database("threads").count({ count: "id" }).first(),
      ]);

    const categoryIds = categories.map(({ id }) => String(id));
    let activity: CategoryActivity[] = [];

    if (categoryIds.length > 0) {
      const rankedActivity = database("posts")
        .join("threads", "posts.thread_id", "threads.id")
        .leftJoin("users", "posts.user_id", "users.id")
        .whereIn("threads.category_id", categoryIds)
        .whereNull("posts.deleted_at")
        .select(
          "threads.category_id",
          "threads.public_id as thread_public_id",
          "threads.title as thread_title",
          "posts.created_at",
          "users.id as user_id",
          "users.username",
        )
        .select(
          database.raw(
            "ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC, ?? DESC) AS ??",
            ["threads.category_id", "posts.created_at", "posts.id", "activity_rank"],
          ),
        );
      activity = await database
        .from(rankedActivity.as("ranked_activity"))
        .select<CategoryActivity[]>(
          "category_id",
          "thread_public_id",
          "thread_title",
          "created_at",
          "user_id",
          "username",
        )
        .where("activity_rank", 1);
    }

    const threadCountByCategory = new Map(
      threadCounts.map((row) => [String(row.category_id), toCount(row.count)]),
    );
    const postCountByCategory = new Map(
      postCounts.map((row) => [String(row.category_id), toCount(row.count)]),
    );
    const activityByCategory = new Map(
      activity.map((row) => [
        String(row.category_id),
        {
          threadPublicId: row.thread_public_id,
          threadTitle: row.thread_title,
          createdAt: row.created_at,
          userId: toId(row.user_id),
          username: row.username,
        },
      ]),
    );
    const categoryById = new Map(
      categories.map((category) => [
        String(category.id),
        {
          id: String(category.id),
          parentId: toId(category.parent_id),
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          threadCount: threadCountByCategory.get(String(category.id)) ?? 0,
          postCount: postCountByCategory.get(String(category.id)) ?? 0,
          latestActivity: activityByCategory.get(String(category.id)) ?? null,
        },
      ]),
    );

    const latestThreads = await database("threads")
      .join("categories", "threads.category_id", "categories.id")
      .leftJoin("users", "threads.user_id", "users.id")
      .where({ "categories.is_visible": true })
      .select(
        "categories.slug as category_slug",
        "categories.name as category_name",
        "threads.public_id",
        "threads.title",
        "threads.created_at",
        "users.id as user_id",
        "users.username",
      )
      .orderBy("threads.created_at", "desc")
      .orderBy("threads.id", "desc")
      .limit(10);

    return {
      forumName,
      registeredUsers: toCount(userCount?.count),
      totalPosts: toCount(totalPostCount?.count),
      totalThreads: toCount(totalThreadCount?.count),
      categories: [...categoryById.values()],
      latestThreads: latestThreads.map((thread) => ({
        categorySlug: thread.category_slug,
        categoryName: thread.category_name,
        publicId: thread.public_id,
        title: thread.title,
        createdAt: thread.created_at,
        userId: toId(thread.user_id),
        username: thread.username,
      })),
    };
  }),
);

export const getCategoryPageData = cache(
  async (slug: string, requestedPage: number): Promise<CategoryPageData | null> =>
    withForumDatabase(async (database) => {
      const category = await database("categories")
        .select("id", "name", "slug", "description")
        .where({ slug, is_visible: true })
        .first();
      if (!category) return null;

      const categoryId = String(category.id);
      const [countRow, categoryPostCount] = await Promise.all([
        database("threads").where({ category_id: category.id }).count({ count: "id" }).first(),
        database("posts")
          .join("threads", "posts.thread_id", "threads.id")
          .where({ "threads.category_id": category.id })
          .whereNull("posts.deleted_at")
          .count({ count: "posts.id" })
          .first(),
      ]);
      const threadCount = toCount(countRow?.count);
      const pageCount = Math.ceil(threadCount / categoryPageSize);
      const page = normalizePage(requestedPage, pageCount);

      const threadRows = await database("threads")
        .leftJoin("users", "threads.user_id", "users.id")
        .where({ "threads.category_id": category.id })
        .select(
          "threads.id",
          "threads.public_id",
          "threads.title",
          "threads.views_count",
          "threads.created_at",
          "users.id as author_id",
          "users.username as author_name",
        )
        .orderBy("threads.is_pinned", "desc")
        .orderBy("threads.updated_at", "desc")
        .orderBy("threads.id", "desc")
        .limit(categoryPageSize)
        .offset((page - 1) * categoryPageSize);

      const threadIds = threadRows.map((thread) => thread.id);
      const postCountsPromise: Promise<ThreadPostCountRow[]> =
        threadIds.length > 0
          ? Promise.resolve(
              database<ThreadPostCountRow, ThreadPostCountRow[]>("posts")
              .whereIn("thread_id", threadIds)
              .whereNull("deleted_at")
              .select("thread_id")
              .count({ count: "id" })
              .groupBy("thread_id"),
            )
          : Promise.resolve([]);

      const latestPostAt = database("posts as latest_posts")
        .select("latest_posts.created_at")
        .whereRaw("latest_posts.thread_id = threads.id")
        .whereNull("latest_posts.deleted_at")
        .orderBy("latest_posts.created_at", "desc")
        .orderBy("latest_posts.id", "desc")
        .first();
      const latestPostAuthorId = database("posts as latest_posts")
        .leftJoin("users as latest_users", "latest_posts.user_id", "latest_users.id")
        .select("latest_users.id")
        .whereRaw("latest_posts.thread_id = threads.id")
        .whereNull("latest_posts.deleted_at")
        .orderBy("latest_posts.created_at", "desc")
        .orderBy("latest_posts.id", "desc")
        .first();
      const latestPostAuthorName = database("posts as latest_posts")
        .leftJoin("users as latest_users", "latest_posts.user_id", "latest_users.id")
        .select("latest_users.username")
        .whereRaw("latest_posts.thread_id = threads.id")
        .whereNull("latest_posts.deleted_at")
        .orderBy("latest_posts.created_at", "desc")
        .orderBy("latest_posts.id", "desc")
        .first();

      const threadActivityPromise: Promise<ThreadActivityRow[]> =
        threadIds.length > 0
          ? database<ThreadActivityRow, ThreadActivityRow[]>("threads")
              .whereIn("threads.id", threadIds)
              .select(
                "threads.id",
                latestPostAt.as("latest_post_at"),
                latestPostAuthorId.as("latest_post_author_id"),
                latestPostAuthorName.as("latest_post_author_name"),
              )
          : Promise.resolve([]);
      const [postCounts, threadActivityRows] = await Promise.all([
        postCountsPromise,
        threadActivityPromise,
      ]);
      const postCountByThread = new Map(
        postCounts.map((row) => [String(row.thread_id), toCount(row.count)]),
      );
      const activityByThread = new Map(
        threadActivityRows.map((row) => [
          String(row.id),
          {
            latestPostAt: row.latest_post_at,
            latestPostAuthorId: toId(row.latest_post_author_id),
            latestPostAuthorName: row.latest_post_author_name,
          },
        ]),
      );

      return {
        category: {
          id: categoryId,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          threadCount,
          postCount: toCount(categoryPostCount?.count),
        },
        threads: threadRows.map((thread) => {
          const activity = activityByThread.get(String(thread.id));
          return {
            publicId: thread.public_id,
            title: thread.title,
            viewsCount: toCount(thread.views_count),
            postCount: postCountByThread.get(String(thread.id)) ?? 0,
            createdAt: thread.created_at,
            latestPostAt: activity?.latestPostAt ?? null,
            authorId: toId(thread.author_id),
            authorName: thread.author_name,
            latestPostAuthorId: activity?.latestPostAuthorId ?? null,
            latestPostAuthorName: activity?.latestPostAuthorName ?? null,
          };
        }),
        page,
        pageCount,
      };
    }),
);

export const getCategoryMetadata = cache(
  async (slug: string): Promise<CategoryMetadata> =>
    withForumDatabase(async (database) => {
      const category = await database("categories")
        .select("name", "description")
        .where({ slug, is_visible: true })
        .first();
      return category
        ? { name: category.name, description: category.description ?? "" }
        : null;
    }),
);

export const getThreadMetadata = cache(
  async (categorySlug: string, publicId: string): Promise<ThreadMetadata> =>
    withForumDatabase(async (database) => {
      const thread = await database("threads")
        .join("categories", "threads.category_id", "categories.id")
        .select(
          "categories.name as category_name",
          "categories.slug as category_slug",
          "threads.title",
        )
        .where({
          "categories.slug": categorySlug,
          "categories.is_visible": true,
          "threads.public_id": publicId,
        })
        .first();
      if (!thread) return null;
      return {
        categoryName: thread.category_name,
        categorySlug: thread.category_slug,
        title: thread.title,
      };
    }),
);

export const getThreadPageData = cache(
  async (
    categorySlug: string,
    publicId: string,
    requestedPage: number,
  ): Promise<ThreadPageData | null> =>
    withForumDatabase(async (database) => {
      const thread = await database("threads")
        .join("categories", "threads.category_id", "categories.id")
        .leftJoin("users", "threads.user_id", "users.id")
        .select(
          "threads.id",
          "threads.public_id",
          "threads.title",
          "threads.views_count",
          "threads.created_at",
          "categories.name as category_name",
          "categories.slug as category_slug",
          "users.id as author_id",
          "users.username as author_name",
        )
        .where({
          "categories.slug": categorySlug,
          "categories.is_visible": true,
          "threads.public_id": publicId,
        })
        .first();
      if (!thread) return null;

      const countRow = await database("posts")
        .where({ thread_id: thread.id })
        .whereNull("deleted_at")
        .count({ count: "id" })
        .first();
      const postCount = toCount(countRow?.count);
      const pageCount = Math.ceil(postCount / postPageSize);
      const page = normalizePage(requestedPage, pageCount);
      const posts = await database("posts")
        .leftJoin("users", "posts.user_id", "users.id")
        .select(
          "posts.id",
          "posts.body",
          "posts.body_format",
          "posts.created_at",
          "users.id as author_id",
          "users.username as author_name",
        )
        .where({ "posts.thread_id": thread.id })
        .whereNull("posts.deleted_at")
        .orderBy("posts.created_at", "asc")
        .orderBy("posts.id", "asc")
        .limit(postPageSize)
        .offset((page - 1) * postPageSize);

      return {
        category: { name: thread.category_name, slug: thread.category_slug },
        thread: {
          id: String(thread.id),
          publicId: thread.public_id,
          title: thread.title,
          viewsCount: toCount(thread.views_count),
          createdAt: thread.created_at,
          authorId: toId(thread.author_id),
          authorName: thread.author_name,
        },
        posts: posts.map((post) => ({
          id: String(post.id),
          body: post.body,
          bodyFormat: post.body_format,
          createdAt: post.created_at,
          authorId: toId(post.author_id),
          authorName: post.author_name,
        })),
        postCount,
        page,
        pageCount,
      };
    }),
);

export function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}
