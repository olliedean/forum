exports.up = async function (knex) {
  await knex.schema.createTable("forum_settings", (table) => {
    table.string("key", 191).primary();
    table.text("value").notNullable();
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("forum_settings");
};
