/**
 * Drizzle database client.
 * Connects to Neon PostgreSQL via the serverless driver.
 * Used by: all server functions in src/server/functions/
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://dummy:dummy@dummy.neon.tech/dummy";

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
