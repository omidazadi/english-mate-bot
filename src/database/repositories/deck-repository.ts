import { Deck } from '../models/deck';
import { PoolClient } from 'pg';

export class DeckRepository {
    public async createDeck(
        name: string,
        fullName: string,
        description: string,
        exampleWord: number | null,
        status: 'online' | 'offline',
        level: string,
        price: number,
        poolClient: PoolClient,
    ): Promise<Deck> {
        const result = await poolClient.query(
            `
            INSERT INTO
            deck (name, full_name, description, example_word, status, level, price)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `,
            [name, fullName, description, exampleWord, status, level, price],
        );

        return this.bake(result.rows[0]);
    }

    public async getDeck(
        name: string,
        poolClient: PoolClient,
    ): Promise<Deck | null> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM deck
            WHERE name = $1
            `,
            [name],
        );

        if (result.rowCount === 0) {
            return null;
        }

        return this.bake(result.rows[0]);
    }

    public async getDeckByFullName(
        fullName: string,
        poolClient: PoolClient,
    ): Promise<Deck | null> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM deck
            WHERE full_name = $1
            `,
            [fullName],
        );

        if (result.rowCount === 0) {
            return null;
        }

        return this.bake(result.rows[0]);
    }

    public async updateDeck(deck: Deck, poolClient: PoolClient): Promise<void> {
        await poolClient.query(
            `
            UPDATE deck
            SET full_name = $2, description = $3, example_word = $4, status = $5, level = $6, price = $7
            WHERE name = $1
            `,
            [
                deck.name,
                deck.fullName,
                deck.description,
                deck.exampleWord,
                deck.status,
                deck.level,
                deck.price,
            ],
        );
    }

    public async deleteDeck(
        name: string,
        poolClient: PoolClient,
    ): Promise<void> {
        await poolClient.query(
            `
            DELETE
            FROM deck
            WHERE name = $1
            `,
            [name],
        );
    }

    public async getOnlineDecks(poolClient: PoolClient): Promise<Array<Deck>> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM deck
            WHERE status = 'online'
            `,
        );

        return result.rows.map((row) => this.bake(row));
    }

    private bake(row: any): Deck {
        return new Deck(
            row.name,
            row.full_name,
            row.description,
            row.example_word,
            row.status,
            row.level,
            row.price,
        );
    }
}
