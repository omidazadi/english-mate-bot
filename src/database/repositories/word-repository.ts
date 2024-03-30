import { Word } from '../models/word';
import { PoolClient } from 'pg';

export class WordRepository {
    public async createWord(
        front: string,
        back: string | null,
        media: string | null,
        accessType: 'public' | 'paid' | 'private',
        poolClient: PoolClient,
    ): Promise<Word> {
        const result = await poolClient.query(
            `
            INSERT INTO
            word (front, back, media, access_type)
            VALUES
                ($1, $2, $3, $4)
            RETURNING *
            `,
            [front, back, media, accessType],
        );

        return this.bake(result.rows[0]);
    }

    public async updateWord(word: Word, poolClient: PoolClient): Promise<void> {
        await poolClient.query(
            `
            UPDATE word
            SET front = $2, back = $3, media = $4, access_type = $5
            WHERE owner = $1
            `,
            [word.id, word.front, word.back, word.media, word.accessType],
        );
    }

    private bake(row: any): Word {
        return new Word(
            row.id,
            row.front,
            row.back,
            row.media,
            row.access_type,
        );
    }
}
