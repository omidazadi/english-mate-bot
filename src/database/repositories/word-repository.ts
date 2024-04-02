import { Word } from '../models/word';
import { PoolClient } from 'pg';

export class WordRepository {
    public async createWord(
        front: string,
        back: string | null,
        media: string | null,
        accessType: 'public' | 'paid' | 'private',
        tag: number,
        poolClient: PoolClient,
    ): Promise<Word> {
        const result = await poolClient.query(
            `
            INSERT INTO
            word (front, back, media, access_type, tag)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [front, back, media, accessType, tag],
        );

        return this.bake(result.rows[0]);
    }

    public async getWord(
        id: number,
        poolClient: PoolClient,
    ): Promise<Word | null> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM word
            WHERE id = $1
            `,
            [id],
        );

        if (result.rowCount === 0) {
            return null;
        }

        return this.bake(result.rows[0]);
    }

    public async getPublicWordByFront(
        front: string,
        poolClient: PoolClient,
    ): Promise<Word | null> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM word
            WHERE 
                front = $1
                    AND
                access_type = 'public'
            `,
            [front],
        );

        if (result.rowCount === 0) {
            return null;
        }

        return this.bake(result.rows[0]);
    }

    public async deleteWord(id: number, poolClient: PoolClient): Promise<void> {
        await poolClient.query(
            `
            DELETE
            FROM word
            WHERE id = $1
            `,
            [id],
        );
    }

    public async updateWord(word: Word, poolClient: PoolClient): Promise<void> {
        await poolClient.query(
            `
            UPDATE word
            SET front = $2, back = $3, media = $4, access_type = $5, tag = $6
            WHERE id = $1
            `,
            [
                word.id,
                word.front,
                word.back,
                word.media,
                word.accessType,
                word.tag,
            ],
        );
    }

    public async getLatestTag(poolClient: PoolClient): Promise<number> {
        const result = await poolClient.query(
            `
            SELECT COALESCE(MAX(tag), 0) as latest_tag
            FROM word
            `,
        );

        return result.rows[0].latest_tag;
    }

    public async getPublicWordSet(
        tag: number,
        poolClient: PoolClient,
    ): Promise<Array<Word>> {
        const result = await poolClient.query(
            `
            SELECT *
            FROM word
            WHERE 
                tag = $1
                    AND
                access_type = 'public'
            `,
            [tag],
        );

        return result.rows.map((row) => this.bake(row));
    }

    private bake(row: any): Word {
        return new Word(
            row.id,
            row.front,
            row.back,
            row.media,
            row.access_type,
            row.tag,
        );
    }
}
