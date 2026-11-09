exports.up = async function (knex) {
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
