import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function verifyDatabaseConnection() {
  try {
    await pool.query("select 1");
  } catch (err) {
    logger.error(
      {
        err,
        cause: err instanceof Error ? err.cause : undefined,
        databaseUrl: process.env["DATABASE_URL"],
      },
      "Database connection check failed during startup",
    );
    process.exit(1);
  }
}

await verifyDatabaseConnection();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
