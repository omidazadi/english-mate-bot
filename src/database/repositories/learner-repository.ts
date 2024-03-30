import { PoolClient } from 'pg';
import { Learner } from '../models/learner';

export class LearnerRepository {
    public async getLearnerByTidLocking(
        tid: string,
        poolClient: PoolClient,
    ): Promise<Learner | null> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM learner
            WHERE tid = $1
            FOR UPDATE
            `,
            [tid],
        );

        if (result.rowCount === 0) {
            return null;
        }

        return this.bake(result.rows[0]);
    }

    public async createLearner(
        tid: string,
        data: Learner.Data,
        accessLevel: Learner.AccessLevel,
        dailyReviews: number,
        dailyAddedWords: number,
        poolClient: PoolClient,
    ): Promise<Learner> {
        const result = await poolClient.query(
            `
            INSERT INTO
            learner (tid, data, access_level, daily_reviews, daily_added_cards)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [tid, data, accessLevel, dailyReviews, dailyAddedWords],
        );

        return this.bake(result.rows[0]);
    }

    public async updateLearner(
        learner: Learner,
        poolClient: PoolClient,
    ): Promise<void> {
        await poolClient.query(
            `
            UPDATE learner
            SET data = $2, access_level = $3, daily_reviews = $4, daily_added_cards = $5
            WHERE id = $1
            `,
            [
                learner.id,
                learner.data,
                learner.accessLevel,
                learner.dailyReviews,
                learner.dailyAddedCards,
            ],
        );
    }

    public async getNotificationData(
        poolClient: PoolClient,
    ): Promise<Array<[string, number]>> {
        const result = await poolClient.query(
            `
            SELECT learner.tid as tid, COUNT(CASE WHEN card.is_due = TRUE THEN 1 END) as no_dues
            FROM learner LEFT JOIN card ON learner.id = card.owner
            GROUP BY learner.tid
            `,
        );

        return result.rows.map((row) => [
            row.tid as string,
            parseInt(row.no_dues),
        ]);
    }

    public async resetDailyStatistics(poolClient: PoolClient): Promise<void> {
        await poolClient.query(
            `
            UPDATE learner
            SET daily_reviews = 0, daily_added_cards = 0
            `,
        );
    }

    private bake(row: any): Learner {
        return new Learner(
            row.id,
            row.tid,
            row.data,
            row.access_level,
            row.daily_reviews,
            row.daily_added_cards,
        );
    }
}
