const { db } = require("../db");

/**
 * Returns the next order_index for the story (max + 1).
 */
async function nextOrderIndex(story_id, trx = db) {
  const row = await trx("paragraphs")
    .where({ story_id })
    .max({ max_order: "order_index" })
    .first();
  const max = row && row.max_order;
  return (max || 0) + 1;
}

/**
 * Adds a paragraph using a transaction to avoid race conditions.
 * Returns the inserted paragraph (with id, created_at).
 */
async function addParagraph({ story_id, user_id, text }) {
  return db.transaction(async (trx) => {
    const order_index = await nextOrderIndex(story_id, trx);
    const [row] = await trx("paragraphs")
      .insert({ story_id, user_id, text, order_index })
      .returning(["id", "story_id", "user_id", "text", "order_index", "created_at"]);
    return row;
  });
}

async function listByStoryOrdered(story_id) {
  return db("paragraphs")
    .where({ story_id })
    .orderBy("order_index", "asc");
}

async function lastParagraph(story_id) {
  return db("paragraphs")
    .where({ story_id })
    .orderBy("order_index", "desc")
    .first();
}

async function countByStory(story_id) {
  const row = await db("paragraphs")
    .where({ story_id })
    .count({ count: "*" })
    .first();
  return Number(row.count || 0);
}

module.exports = {
  addParagraph,
  listByStoryOrdered,
  lastParagraph,
  countByStory,
  nextOrderIndex,
};