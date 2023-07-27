DROP TABLE IF EXISTS "star" CASCADE;
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
