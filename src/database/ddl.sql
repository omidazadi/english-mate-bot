CREATE TABLE IF NOT EXISTS meta_data (
    meta_key VARCHAR(256) PRIMARY KEY,
    meta_value VARCHAR(256) DEFAULT NULL
);

INSERT INTO meta_data (meta_key, meta_value)
VALUES ('version', '000.000.000')
ON CONFLICT (meta_key)
    DO NOTHING;

-----------------------------------------------------------------------------------------------------------------------

DO $$
    DECLARE version VARCHAR(256) := (
        SELECT meta_value
        FROM meta_data
        WHERE meta_key = 'version'
    );
    DECLARE v0_1_0 VARCHAR(20) := '000.010.000';
    DECLARE v0_3_0 VARCHAR(20) := '000.030.000';
    DECLARE v0_4_0 VARCHAR(20) := '000.040.000';

    BEGIN
        -- v0.1.0
        IF version < v0_1_0 THEN
            CREATE TABLE IF NOT EXISTS learner (
                id SERIAL PRIMARY KEY,
                tid VARCHAR(64) UNIQUE NOT NULL,
                data JSONB NOT NULL,
                access_level VARCHAR(64) NOT NULL CHECK (access_level = 'user' OR access_level = 'admin'),
                daily_reviews INTEGER NOT NULL,
                daily_added_cards INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS word (
                id SERIAL PRIMARY KEY,
                front VARCHAR(256) NOT NULL,
                back TEXT,
                media VARCHAR(256),
                access_type VARCHAR(64) NOT NULL CHECK (access_type = 'public' OR access_type = 'paid' OR access_type = 'private'),
                tag INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS card (
                owner INTEGER NOT NULL,
                word INTEGER NOT NULL,
                fsrs_info JSONB NOT NULL,
                is_due BOOLEAN NOT NULL,
                FOREIGN KEY (owner) 
                    REFERENCES learner (id)
                    ON DELETE CASCADE,
                FOREIGN KEY (word) 
                    REFERENCES word (id)
                    ON DELETE CASCADE,
                PRIMARY KEY (owner, word)
            );

            UPDATE meta_data
            SET meta_value = v0_1_0
            WHERE meta_key = 'version';
        END IF;

        -- v0.3.0
        IF version < v0_3_0 THEN
            CREATE TABLE IF NOT EXISTS deck (
                name VARCHAR(8) PRIMARY KEY,
                full_name VARCHAR(256) UNIQUE NOT NULL,
                description TEXT NOT NULL,
                example_word INTEGER,
                status VARCHAR(64) NOT NULL CHECK (status = 'online' OR status = 'offline'),
                FOREIGN KEY (example_word) 
                    REFERENCES word (id)
                    ON DELETE SET NULL
            );

            ALTER TABLE word
            ADD COLUMN deck VARCHAR(8);

            ALTER TABLE word
            ADD CONSTRAINT word_deck_fk
            FOREIGN KEY (deck)
                REFERENCES deck (name)
                ON DELETE CASCADE;

            UPDATE meta_data
            SET meta_value = v0_3_0
            WHERE meta_key = 'version';
        END IF;

        -- v0.4.0
        IF version < v0_4_0 THEN
            ALTER TABLE learner
            ADD COLUMN maximum_daily_reviews INTEGER NOT NULL DEFAULT 20,
            ADD COLUMN is_muted BOOLEAN NOT NULL DEFAULT FALSE;

            ALTER TABLE deck
            ADD COLUMN level VARCHAR(64) NOT NULL DEFAULT '',
            ADD COLUMN price INTEGER NOT NULL DEFAULT 0;

            UPDATE meta_data
            SET meta_value = v0_4_0
            WHERE meta_key = 'version';
        END IF;
    END
$$;