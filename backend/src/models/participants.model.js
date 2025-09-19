const { db } = require("../db");

async function addParticipant({ story_id, user_id, join_order }) {
  const [row] = await db("participants")
    .insert({ story_id, user_id, join_order })
    .returning(["id", "story_id", "user_id", "join_order", "created_at"]);
  return row;
}

async function listByStory(story_id) {
  return db("participants")
    .where({ story_id })
    .orderBy("join_order", "asc");
}

async function isParticipant({ story_id, user_id }) {
  const row = await db("participants").where({ story_id, user_id }).first();
  return !!row;
}

async function getJoinOrder({ story_id, user_id }) {
  const row = await db("participants")
    .select("join_order")
    .where({ story_id, user_id })
    .first();
  return row ? row.join_order : null;
}

async function nextJoinOrder(story_id) {
  const row = await db("participants")
    .where({ story_id })
    .max({ max_join: "join_order" })
    .first();
  const max = row && row.max_join;
  return (max || 0) + 1;
}

async function removeParticipant({ story_id, user_id }) {
  return db("participants").where({ story_id, user_id }).del();
}

module.exports = {
  addParticipant,
  listByStory,
  isParticipant,
  getJoinOrder,
  nextJoinOrder,
  removeParticipant,
};