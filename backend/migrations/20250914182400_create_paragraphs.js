/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("paragraphs", (t) => {
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
    t.text("text").notNullable();
    t.integer("order_index").notNullable(); // paragraph sequence number
    t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();

    t.unique(["story_id", "order_index"]); // enforce paragraph order uniqueness
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("paragraphs");
};