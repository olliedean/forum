exports.up = async function (knex) {
  await knex.schema.createTable("posts", (table) => {
    table.bigIncrements("id");
    table.bigInteger("thread_id").unsigned().notNullable();
    table.bigInteger("user_id").unsigned().nullable();
    table.text("body").notNullable();
    table.string("body_format", 20).notNullable().defaultTo("plain");
    table.integer("edit_count").notNullable().defaultTo(0);
    table.timestamp("edited_at", { useTz: true }).nullable();
    table.timestamp("deleted_at", { useTz: true }).nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.foreign("thread_id").references("id").inTable("threads").onDelete("CASCADE");
    table.foreign("user_id").references("id").inTable("users").onDelete("SET NULL");
    table.index(["thread_id", "created_at"], "posts_thread_created_index");
    table.index(["user_id", "created_at"], "posts_author_created_index");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("posts");
};
