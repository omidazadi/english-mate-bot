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
    DECLARE v1_0_0 VARCHAR(20) := '001.000.000';

    BEGIN
        -- v1.0.0
        IF version < v1_0_0 THEN
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
                access_type VARCHAR(64) NOT NULL CHECK (access_type = 'public' OR access_type = 'paid' OR access_type = 'private')
            );

            CREATE TABLE IF NOT EXISTS card (
                owner INTEGER NOT NULL,
                word INTEGER NOT NULL,
                fsrs_info JSONB NOT NULL,
                is_due BOOLEAN NOT NULL,
                FOREIGN KEY (owner) REFERENCES learner (id),
                FOREIGN KEY (word) REFERENCES word (id),
                PRIMARY KEY (owner, word)
            );

            UPDATE meta_data
            SET meta_value = v1_0_0
            WHERE meta_key = 'version';
        END IF;
    END
$$;