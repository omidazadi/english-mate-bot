import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Card as FSRSCard } from 'fsrs.js';
import { PoolClient } from 'pg';
import { Card } from '../models/card';

export class CardRepository {
    public async createCard(
        owner: number,
        word: number,
        fsrsInfo: FSRSCard,
        isDue: boolean,
        poolClient: PoolClient,
    ): Promise<Card> {
        const result = await poolClient.query(
            `
            INSERT INTO
            card (owner, word, fsrs_info, is_due)
            VALUES
                ($1, $2, $3, $4)
            RETURNING *
            `,
            [owner, word, instanceToPlain(fsrsInfo), isDue],
        );

        return this.bake(result.rows[0]);
    }

    public async getCardByOwnerAndFront(
        owner: number,
        front: string,
        poolClient: PoolClient,
    ): Promise<Card | null> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM card
            WHERE
                card.owner = $1
                    AND
                EXISTS (
                    SELECT 1
                    FROM word
                    WHERE
                        card.word = word.id
                            AND
                        word.front = $2
                )
            `,
            [owner, front],
        );

        if (result.rowCount === 0) {
            return null;
        }

        return this.bake(result.rows[0]);
    }

    public async updateAllDueDates(poolClient: PoolClient): Promise<void> {
        await poolClient.query(
            `
            UPDATE card
            SET is_due = TRUE
            WHERE (fsrs_info->>'due')::timestamp < NOW()
            `,
        );
    }

    private bake(row: any): Card {
        return new Card(
            row.owner,
            row.word,
            plainToInstance(FSRSCard, row.fsrs_info),
            row.is_due,
        );
    }
}
