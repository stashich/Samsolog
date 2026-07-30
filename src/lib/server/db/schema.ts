import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const leaderboard = pgTable('leaderboard', {
	id: serial('id').primaryKey(),
	playerName: text('player_name').notNull(),
	score: integer('score').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
