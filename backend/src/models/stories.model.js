const { db } = require("../db");

async function createStory({ title, created_by }) {
  const [row] = await db("stories")
    .insert({ title, created_by, status: "ongoing" })
    .returning(["id", "title", "status", "created_by", "created_at"]);
  return row;
}

async function findById(id) {
  return db("stories").where({ id }).first();
}

async function listOngoing({ limit = 50, offset = 0 } = {}) {
  return db("stories")
    .where({ status: "ongoing" })
    .orderBy("created_at", "desc")
    .limit(limit)
    .offset(offset);
}

async function listFinished({ limit = 50, offset = 0 } = {}) {
  return db("stories")
    .where({ status: "finished" })
    .orderBy("finished_at", "desc")
    .limit(limit)
    .offset(offset);
}

async function listByUser(userId, { limit = 50, offset = 0 } = {}) {
  return db("stories")
    .where({ created_by: userId })
    .orderBy("created_at", "desc")
    .limit(limit)
    .offset(offset);
}

async function finishStory(storyId) {
  const [row] = await db("stories")
    .where({ id: storyId, status: "ongoing" })
    .update({ status: "finished", finished_at: db.fn.now() })
    .returning(["id", "title", "status", "finished_at"]);
  return row;
}

async function deleteStory(storyId) {
  // paragraphs & participants will cascade if your FK ON DELETE CASCADE is set
  return db("stories").where({ id: storyId }).del();
}

module.exports = {
  createStory,
  findById,
  listOngoing,
  listFinished,
  listByUser,
  finishStory,
  deleteStory,
};