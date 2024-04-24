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

    public async getLearnerByTid(
        tid: string,
        poolClient: PoolClient,
    ): Promise<Learner | null> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM learner
            WHERE tid = $1
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
        maximumDailyReviews: number,
        isMuted: boolean,
        poolClient: PoolClient,
    ): Promise<Learner> {
        const result = await poolClient.query(
            `
            INSERT INTO
            learner (tid, data, access_level, daily_reviews, daily_added_cards, maximum_daily_reviews, is_muted)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `,
            [
                tid,
                data,
                accessLevel,
                dailyReviews,
                dailyAddedWords,
                maximumDailyReviews,
                isMuted,
            ],
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
            SET data = $2, access_level = $3, daily_reviews = $4, daily_added_cards = $5, maximum_daily_reviews = $6, is_muted = $7
            WHERE id = $1
            `,
            [
                learner.id,
                learner.data,
                learner.accessLevel,
                learner.dailyReviews,
                learner.dailyAddedCards,
                learner.maximumDailyReviews,
                learner.isMuted,
            ],
        );
    }

    public async getNotificationData(
        poolClient: PoolClient,
    ): Promise<Array<[string, number]>> {
        const result = await poolClient.query(
            `
            SELECT learner.tid as tid, LEAST(COUNT(CASE WHEN card.is_due = TRUE THEN 1 END), learner.maximum_daily_reviews) as no_dues
            FROM learner LEFT JOIN card ON learner.id = card.owner
            WHERE is_muted = FALSE
            GROUP BY learner.tid, learner.maximum_daily_reviews
            `,
        );

        return result.rows.map((row) => [
            row.tid as string,
            parseInt(row.no_dues),
        ]);
    }

    public async muteLearner(
        tid: string,
        poolClient: PoolClient,
    ): Promise<void> {
        await poolClient.query(
            `
            UPDATE learner
            SET is_muted = TRUE
            WHERE tid = $1
            `,
            [tid],
        );
    }

    public async unmuteLearner(
        tid: string,
        poolClient: PoolClient,
    ): Promise<void> {
        await poolClient.query(
            `
            UPDATE learner
            SET is_muted = FALSE
            WHERE tid = $1
            `,
            [tid],
        );
    }

    public async setMaximumDailyReviews(
        id: number,
        maximumDailyReviews: number,
        poolClient: PoolClient,
    ): Promise<void> {
        await poolClient.query(
            `
            UPDATE learner
            SET maximum_daily_reviews = $2
            WHERE id = $1
            `,
            [id, maximumDailyReviews],
        );
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
            row.maximum_daily_reviews,
            row.is_muted,
        );
    }
}
