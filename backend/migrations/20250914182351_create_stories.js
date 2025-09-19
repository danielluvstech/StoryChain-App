/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("stories", (t) => {
    t.increments("id").primary();
    t.string("title").notNullable();
    t
      .enu("status", ["ongoing", "finished"], {
        useNative: true,
        enumName: "story_status_enum",
      })
      .defaultTo("ongoing");
    t
      .integer("created_by")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    t.timestamp("finished_at").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("stories");
  await knex.schema.raw('DROP TYPE IF EXISTS story_status_enum');
};