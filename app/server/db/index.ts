/**
 * Drizzle database client.
 * Connects to Neon PostgreSQL via the serverless driver.
 * Used by: all server functions in app/server/functions/
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL || "");
export const db = drizzle(sql, { schema });
