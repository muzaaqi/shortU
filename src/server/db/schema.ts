/**
 * Drizzle database schema definitions.
 * Canonical schema for Better Auth and shortU application domain.
 * Used by: src/server/db/index.ts, drizzle.config.ts, migrations
 */
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ==========================================
// Better Auth Tables
// ==========================================

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  issuer: text("issuer").notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// Application Domain Tables
// ==========================================

export const links = pgTable("links", {
  id: text("id").primaryKey(), // nanoid()
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }), // null = anonymous
  slug: text("slug").notNull().unique(),
  originalUrl: text("original_url").notNull(),
  qrCode: text("qr_code"), // base64 data URL, set at creation
  adEnabled: boolean("ad_enabled").notNull().default(false),
  clickCount: integer("click_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const clicks = pgTable("clicks", {
  id: text("id").primaryKey(),
  linkId: text("link_id").references(() => links.id, { onDelete: "cascade" }),
  clickedAt: timestamp("clicked_at").notNull(),
  userAgent: text("user_agent"),
});

export type User = typeof users.$inferSelect;
export type Link = typeof links.$inferSelect;
export type Click = typeof clicks.$inferSelect;
