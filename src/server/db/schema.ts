// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTableCreator,
  real,
  serial,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `naomisugar_${name}`);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  })
);

export const trendEnum = pgEnum('trend', ['SingleDown', 'FortyFiveDown', 'Flat', 'FortyFiveUp', 'SingleUp', 'NotComputable']);
export const libre = createTable(
  "libre",
  {
    date: timestamp("date").primaryKey(),
    value: real("value").notNull(),
    is_high: boolean('is_high').notNull(),
    is_low: boolean('is_low').notNull(),
    trend: trendEnum("trend").notNull(),
  }
);

export const libreCurrent = createTable(
  "libreCurrent",
  {
    id: serial("id").primaryKey(),
    date: timestamp("date").notNull(),
    value: real("value").notNull(),
    is_high: boolean('is_high').notNull(),
    is_low: boolean('is_low').notNull(),
    trend: trendEnum("trend").notNull(),
  }
);