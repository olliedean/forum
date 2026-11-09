exports.up = async function (knex) {
  const duplicateUsername = await knex("users")
    .select(knex.raw("LOWER(??)", ["username"]))
    .count({ count: "id" })
    .groupByRaw("LOWER(??)", ["username"])
    .havingRaw("COUNT(*) > 1")
    .first();
  const duplicateEmail = await knex("users")
    .select(knex.raw("LOWER(??)", ["email"]))
    .count({ count: "id" })
    .groupByRaw("LOWER(??)", ["email"])
    .havingRaw("COUNT(*) > 1")
    .first();

  if (duplicateUsername || duplicateEmail) {
    throw new Error(
      "Cannot enforce unique user identifiers while duplicate usernames or emails exist, ignoring case.",
    );
  }

  await knex.schema.alterTable("users", (table) => {
    table.unique("username", "users_username_unique");
    table.unique("email", "users_email_unique");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("users", (table) => {
    table.dropUnique(["username"], "users_username_unique");
    table.dropUnique(["email"], "users_email_unique");
  });
};
