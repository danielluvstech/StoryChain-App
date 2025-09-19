/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("participants", (t) => {
    t.increments("id").primary();
    t
      .integer("story_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("stories")
      .onDelete("CASCADE");
    t
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    t.integer("join_order").notNullable();
    t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();

    t.unique(["story_id", "user_id"]); // each user joins a story once
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("participants");
};