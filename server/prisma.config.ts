// Prisma 6+ config. CLI (migrate deploy / db seed) reads the DB connection
// from here, NOT from package.json#prisma. Keep both URLs wired so
// migrations use the direct connection and the app uses the pooler.
// NOTE: dotenv/config only loads a local .env file. On Render the values
// come from the dashboard environment, which takes precedence.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_URL"),
  },
});
