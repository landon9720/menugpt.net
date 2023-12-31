DROP TABLE IF EXISTS "prompt" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

CREATE TABLE "user" (
    user_id VARCHAR PRIMARY KEY,
    credits INTEGER NOT NULL DEFAULT 0,
    nickname VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    picture VARCHAR NOT NULL,
    locale VARCHAR NOT NULL,
    email VARCHAR NOT NULL
);

CREATE TABLE prompt (
    prompt_id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES "user" (user_id) ON DELETE CASCADE,
    body VARCHAR NULL,
    input VARCHAR NOT NULL,
    parent_id VARCHAR REFERENCES prompt (prompt_id),
    timestamp TIMESTAMP NOT NULL
);

CREATE INDEX idx_prompt_timestamp ON prompt (timestamp DESC);

CREATE TABLE star (
    user_id VARCHAR REFERENCES "user" (user_id) ON DELETE CASCADE,
    prompt_id VARCHAR REFERENCES prompt (prompt_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, prompt_id)
);

INSERT INTO prompt (prompt_id, input, timestamp)
VALUES ('1', 'Existence', NOW());

CREATE INDEX prompt_fulltext_idx ON prompt USING gin (to_tsvector('english', input || ' ' || body));

ALTER TABLE prompt ADD COLUMN body_user_id VARCHAR NULL;

ALTER TABLE prompt ADD CONSTRAINT fk_body_user_id FOREIGN KEY (body_user_id) REFERENCES "user" (user_id) ON DELETE CASCADE;

ALTER TABLE prompt DROP COLUMN user_id;
ALTER TABLE prompt DROP COLUMN body_user_id;
DROP TABLE star;
DROP TABLE "user";
