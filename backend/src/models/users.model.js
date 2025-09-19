const { db } = require("../db");

async function findById(id) {
  return db("users").where({ id }).first();
}

async function findByUsername(username) {
  return db("users").where({ username }).first();
}

async function createUser({ username, password_hash }) {
  const [row] = await db("users")
    .insert({ username, password_hash })
    .returning(["id", "username", "created_at"]);
  return row;
}

async function listAll({ limit = 50, offset = 0 } = {}) {
  return db("users")
    .select("id", "username", "created_at")
    .orderBy("id", "asc")
    .limit(limit)
    .offset(offset);
}

module.exports = {
  findById,
  findByUsername,
  createUser,
  listAll,
};