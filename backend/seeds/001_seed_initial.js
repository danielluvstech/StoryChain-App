const bcrypt = require("bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clear all existing data (order matters because of FKs)
  await knex("paragraphs").del();
  await knex("participants").del();
  await knex("stories").del();
  await knex("users").del();

  // Insert users
  const password = await bcrypt.hash("1234", 10);
  const [dan, alice, bob] = await knex("users")
    .insert([
      { username: "dan", password_hash: password },
      { username: "alice", password_hash: password },
      { username: "bob", password_hash: password },
    ])
    .returning(["id", "username"]);

  // Insert a story
  const [story] = await knex("stories")
    .insert({
      title: "The Mysterious Forest",
      status: "ongoing",
      created_by: dan.id,
    })
    .returning(["id", "title"]);

  // Add participants
  const participants = await knex("participants")
    .insert([
      { story_id: story.id, user_id: dan.id, join_order: 1 },
      { story_id: story.id, user_id: alice.id, join_order: 2 },
      { story_id: story.id, user_id: bob.id, join_order: 3 },
    ])
    .returning(["id", "user_id", "story_id"]);

  // Add paragraphs (simulate turns)
  await knex("paragraphs").insert([
    {
      story_id: story.id,
      user_id: dan.id,
      text: "It was a dark night when Dan entered the mysterious forest.",
      order_index: 1,
    },
    {
      story_id: story.id,
      user_id: alice.id,
      text: "Alice followed closely, hearing whispers between the trees.",
      order_index: 2,
    },
    {
      story_id: story.id,
      user_id: bob.id,
      text: "Bob picked up a glowing stone, unaware it would change everything.",
      order_index: 3,
    },
  ]);
};