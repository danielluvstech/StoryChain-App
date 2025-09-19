const knex = require("knex");
const config = require("../knexfile");

const db = knex(config.development);

// simple SELECT 1 query to check DB connectivity
async function healthcheck() {
  const result = await db.raw("SELECT 1 as ok");
  return result.rows[0].ok === 1;
}

module.exports = { db, healthcheck };
