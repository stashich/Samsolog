import { db } from '$lib/server/db';
import { leaderboard } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const scores = await db
			.select()
			.from(leaderboard)
			.orderBy(desc(leaderboard.score))
			.limit(5);
		return { scores };
	} catch (error) {
		// Gracefully handle database load failure if DATABASE_URL is not set yet
		console.warn('Database is not connected. Showing mock leaderboard scores. Error:', error);
		return {
			scores: [
				{ id: 1, playerName: 'CyberKnight', score: 9850, createdAt: new Date() },
				{ id: 2, playerName: 'NeoGamer', score: 8400, createdAt: new Date() },
				{ id: 3, playerName: 'PixelLord', score: 7210, createdAt: new Date() }
			]
		};
	}
};

export const actions: Actions = {
	submitScore: async ({ request }) => {
		const data = await request.formData();
		const playerName = data.get('playerName') as string;
		const score = parseInt(data.get('score') as string, 10);

		if (!playerName || isNaN(score)) {
			return { success: false, error: 'Invalid name or score' };
		}

		try {
			await db.insert(leaderboard).values({
				playerName,
				score
			});
			return { success: true };
		} catch (error) {
			console.error('Failed to save score to database:', error);
			return { success: false, error: 'Could not connect to database' };
		}
	}
};
