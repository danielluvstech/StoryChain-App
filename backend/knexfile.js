require("dotenv").config();

const {
  DATABASE_URL,
  PGHOST,
  PGPORT,
  PGUSER,
  PGPASSWORD,
  PGDATABASE
} = process.env;

const connection =
  DATABASE_URL || {
    host: PGHOST || "127.0.0.1",
    port: PGPORT ? Number(PGPORT) : 5432,
    user: PGUSER || "postgres",
    password: PGPASSWORD || "",
    database: PGDATABASE || "storychain_dev",
  };

module.exports = {
  development: {
    client: "pg",
    connection,
    pool: { min: 0, max: 10 },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};
