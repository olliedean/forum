exports.up = async function (knex) {
  await knex.schema.createTable("sessions", (table) => {
    table.bigIncrements("id");
    table.bigInteger("user_id").unsigned().notNullable();
    table.string("token_hash", 255).notNullable().unique();
    table.string("ip_address", 45).nullable();
    table.text("user_agent").nullable();
    table.timestamp("last_seen_at", { useTz: true }).nullable();
    table.timestamp("expires_at", { useTz: true }).notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.index(["user_id", "expires_at"], "sessions_user_expiry_index");
    table.index("expires_at", "sessions_expiry_index");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("sessions");
};
