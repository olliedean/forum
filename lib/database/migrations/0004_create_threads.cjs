exports.up = async function (knex) {
  await knex.schema.createTable("threads", (table) => {
    table.bigIncrements("id");
    table.string("public_id", 36).notNullable().unique();
    table.bigInteger("category_id").unsigned().notNullable();
    table.bigInteger("user_id").unsigned().nullable();
    table.string("title", 200).notNullable();
    table.integer("views_count").notNullable().defaultTo(0);
    table.boolean("is_pinned").notNullable().defaultTo(false);
    table.boolean("is_locked").notNullable().defaultTo(false);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.foreign("category_id").references("id").inTable("categories").onDelete("RESTRICT");
    table.foreign("user_id").references("id").inTable("users").onDelete("SET NULL");
    table.index(
      ["category_id", "is_pinned"],
      "threads_category_activity_index",
    );
    table.index(["user_id", "created_at"], "threads_author_created_index");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("threads");
};
