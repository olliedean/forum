const categoryName = "General";
const threadTitle = "Welcome to the forum";
const postBody = "Welcome to your new forum!";

exports.up = async function (knex) {
  const categorySlug = globalThis.crypto.randomUUID().replaceAll("-", "");
  await knex("categories").insert({
    name: categoryName,
    slug: categorySlug,
    description: "A first category for the forum",
  });
  const category = await knex("categories").where({ slug: categorySlug }).first("id");

  if (!category) {
    throw new Error("Could not find the default category after creating it.");
  }

  const user = await knex("users").where({ id: 1 }).first("id");
  const userId = user ? 1 : null;

  const publicId = globalThis.crypto.randomUUID();
  await knex("threads").insert({
    public_id: publicId,
    category_id: category.id,
    user_id: userId,
    title: threadTitle,
  });
  const thread = await knex("threads").where({ public_id: publicId }).first("id");

  if (!thread) {
    throw new Error("Could not find the default thread after creating it.");
  }

  await knex("posts").insert({
    thread_id: thread.id,
    user_id: userId,
    body: postBody,
  });
};

exports.down = async function (knex) {
  const category = await knex("categories")
    .where({ name: categoryName })
    .whereExists(function () {
      this.select("*")
        .from("threads")
        .whereRaw("threads.category_id = categories.id")
        .where({ title: threadTitle });
    })
    .orderBy("id", "desc")
    .first("id");

  if (category) {
    await knex("threads")
      .where({ category_id: category.id, title: threadTitle })
      .del();
    await knex("categories").where({ id: category.id }).del();
  }
};
