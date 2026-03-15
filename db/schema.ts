import { jsonb, integer, pgTable, text } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    creator: text('creator').notNull(),
    stake: text('stake').notNull(),
    status: text('status').notNull().default('Pending'),
    participants: jsonb('participants').$type<string[]>().notNull(),
    notes: text('notes'),
});