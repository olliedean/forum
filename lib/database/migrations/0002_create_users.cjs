exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements("id");
    table.string("username", 32).notNullable();
    table.string("email", 254).notNullable();
    table.text("password_hash").notNullable();
    table.text("ranks").notNullable().defaultTo("[]");
    table.string("profile_title", 100).nullable();
    table.text("bio").nullable();
    table.text("avatar_url").nullable();
    table.timestamp("email_verified_at", { useTz: true }).nullable();
    table.timestamp("last_seen_at", { useTz: true }).nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("users");
};
