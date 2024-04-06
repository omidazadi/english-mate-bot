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

    public async getCardByOwnerAndWord(
        owner: number,
        word: number,
        poolClient: PoolClient,
    ): Promise<Card | null> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM card
            WHERE
                card.owner = $1
                    AND
                card.word = $2
            `,
            [owner, word],
        );

        if (result.rowCount === 0) {
            return null;
        }

        return this.bake(result.rows[0]);
    }

    public async getOneDueCard(
        owner: number,
        poolClient: PoolClient,
    ): Promise<Card | null> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM card
            WHERE 
                owner = $1
                    AND
                is_due = TRUE
            ORDER BY
                fsrs_info->'state'
                    DESC
            LIMIT 1
            `,
            [owner],
        );

        if (result.rowCount === 0) {
            return null;
        }

        return this.bake(result.rows[0]);
    }

    public async getNoCards(
        owner: number,
        poolClient: PoolClient,
    ): Promise<Card | null> {
        const result = await poolClient.query(
            `
            SELECT COUNT(*) as no_cards
            FROM card
            WHERE owner = $1
            `,
            [owner],
        );

        return result.rows[0].no_cards;
    }

    public async getNoDueCards(
        owner: number,
        poolClient: PoolClient,
    ): Promise<Card | null> {
        const result = await poolClient.query(
            `
            SELECT COUNT(*) as no_due_cards
            FROM card
            WHERE 
                owner = $1
                    AND
                is_due = TRUE
            `,
            [owner],
        );

        return result.rows[0].no_due_cards;
    }

    public async updateCard(card: Card, poolClient: PoolClient): Promise<void> {
        await poolClient.query(
            `
            UPDATE card
            SET fsrs_info = $3, is_due = $4
            WHERE 
                card.owner = $1
                    AND
                card.word = $2
            `,
            [card.owner, card.word, card.fsrsInfo, card.isDue],
        );
    }

    public async deleteCard(
        owner: number,
        word: number,
        poolClient: PoolClient,
    ): Promise<void> {
        await poolClient.query(
            `
            DELETE
            FROM card
            WHERE
                owner = $1
                    AND
                word = $2
            `,
            [owner, word],
        );
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

    public async getNoAllCards(poolClient: PoolClient): Promise<number> {
        const result = await poolClient.query(
            `
            SELECT COUNT(*) as no_all_cards
            FROM card
            `,
        );

        return result.rows[0].no_all_cards;
    }

    public async grantDeckCardsToLearner(
        learnedId: number,
        deckName: string,
        poolClient: PoolClient,
    ): Promise<void> {
        await poolClient.query(
            `
            INSERT
            INTO card (owner, word, fsrs_info, is_due) (
                SELECT $1, word.id, $3, $4
                FROM word
                WHERE 
                    word.deck = $2
                        AND
                    NOT EXISTS (
                        SELECT 1
                        FROM card cc JOIN word ww on cc.word = ww.id
                        WHERE
                            cc.owner = $1
                                AND
                            ww.front = word.front
                    )
            )
            ON CONFLICT
                DO NOTHING
            `,
            [learnedId, deckName, new FSRSCard(), true],
        );
    }

    public async denyDeckCardsFromLearner(
        learnedId: number,
        deckName: string,
        poolClient: PoolClient,
    ): Promise<void> {
        await poolClient.query(
            `
            DELETE
            FROM card
            WHERE
                owner = $1
                    AND
                EXISTS (
                    SELECT 1
                    FROM word
                    WHERE
                        word.deck = $2
                            AND
                        word.id = card.word
                )
            `,
            [learnedId, deckName],
        );
    }

    private bake(row: any): Card {
        const fsrsCard = plainToInstance(FSRSCard, row.fsrs_info);
        fsrsCard.due = new Date(fsrsCard.due);
        fsrsCard.last_review = new Date(fsrsCard.last_review);
        return new Card(row.owner, row.word, fsrsCard, row.is_due);
    }
}
