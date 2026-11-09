exports.up = async function (knex) {
  await knex.schema.createTable("categories", (table) => {
    table.bigIncrements("id");
    table.bigInteger("parent_id").unsigned().nullable();
    table.string("name", 100).notNullable();
    table.string("slug", 100).notNullable().unique();
    table.text("description").nullable();
    table.integer("sort_order").notNullable().defaultTo(0);
    table.boolean("is_visible").notNullable().defaultTo(true);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.foreign("parent_id").references("id").inTable("categories").onDelete("SET NULL");
    table.index(["parent_id", "sort_order"], "categories_parent_sort_index");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("categories");
};
