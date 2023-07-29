import { Client, ClientConfig } from 'pg'

const dbConfig: ClientConfig = {
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.POSTGRES_SSL === 'true',
}

export interface Prompt {
  prompt_id: string
  user_id: string
  body?: string
  body_user_id?: string
  input: string
  parent_id?: string
  timestamp: string
}

export async function getPrompt(promptId: string): Promise<Prompt | null> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const { rows } = await client.query(
      `SELECT * FROM prompt WHERE prompt_id = $1`,
      [promptId],
    )
    if (rows.length === 0) {
      return null
    }
    return { ...rows[0], timestamp: rows[0].timestamp.toUTCString() }
  } catch (error) {
    throw new Error(`Error fetching prompt: ${error}`)
  } finally {
    await client.end()
  }
}

export async function setPrompt(prompt: Prompt): Promise<void> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const { rowCount } = await client.query(
      `INSERT INTO prompt (prompt_id, user_id, body, body_user_id, input, parent_id, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (prompt_id) DO UPDATE
       SET user_id = EXCLUDED.user_id,
           body = EXCLUDED.body,
           body_user_id = EXCLUDED.body_user_id,
           input = EXCLUDED.input,
           parent_id = EXCLUDED.parent_id,
           timestamp = EXCLUDED.timestamp`,
      [
        prompt.prompt_id,
        prompt.user_id,
        prompt.body,
        prompt.body_user_id,
        prompt.input,
        prompt.parent_id,
        new Date(prompt.timestamp),
      ],
    )
    if (rowCount !== 1) {
      throw new Error(
        `Unexpected row count ${rowCount} inserting or updating prompt ${prompt.prompt_id}`,
      )
    }
  } catch (error) {
    throw new Error(`Error updating prompt: ${error}`)
  } finally {
    await client.end()
  }
}

export async function searchPrompts(userInput: string): Promise<Prompt[]> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const { rows } = await client.query(
      `SELECT *
       FROM prompt p
       WHERE to_tsvector('english', p.input || ' ' || p.body) @@ websearch_to_tsquery('english', $1)
       LIMIT 10`,
      [userInput],
    )
    return rows.map((row) => ({
      ...row,
      timestamp: row.timestamp.toUTCString(),
    }))
  } catch (error) {
    throw new Error(`Error searching prompts: ${error}`)
  } finally {
    await client.end()
  }
}

export async function getTopPrompts(): Promise<Prompt[]> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const { rows } = await client.query(
      `SELECT p.*, COUNT(s.prompt_id) AS star_count
       FROM prompt p
       LEFT JOIN star s ON p.prompt_id = s.prompt_id
       WHERE body IS NOT NULL
       GROUP BY p.prompt_id
       ORDER BY star_count DESC, timestamp ASC
       LIMIT 10`,
    )
    return rows.map((row) => ({
      ...row,
      timestamp: row.timestamp.toUTCString(),
    }))
  } catch (error) {
    throw new Error(`Error fetching top prompts: ${error}`)
  } finally {
    await client.end()
  }
}

export async function getRecentPrompts(): Promise<Prompt[]> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const { rows } = await client.query(
      `SELECT * FROM prompt WHERE body IS NOT NULL ORDER BY timestamp DESC LIMIT 10`,
    )
    return rows.map((row) => ({
      ...row,
      timestamp: row.timestamp.toUTCString(),
    }))
  } catch (error) {
    throw new Error(`Error fetching recent prompts: ${error}`)
  } finally {
    await client.end()
  }
}

export async function getPromptChildren(
  parentPromptId: string,
): Promise<Prompt[]> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const { rows } = await client.query(
      `SELECT *
       FROM prompt
       WHERE parent_id = $1
       ORDER BY timestamp ASC`,
      [parentPromptId],
    )
    return rows.map((row) => ({
      ...row,
      timestamp: row.timestamp.toUTCString(),
    }))
  } catch (error) {
    throw new Error(`Error fetching children of prompt: ${error}`)
  } finally {
    await client.end()
  }
}

export async function getGeneratedPromptCount(): Promise<number> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const query = 'SELECT COUNT(*) FROM prompt WHERE body IS NOT NULL'
    const result = await client.query(query)
    const count = parseInt(result.rows[0].count, 10)
    return count
  } catch (error) {
    throw new Error(`Error counting prompt records: ${error}`)
  } finally {
    await client.end()
  }
}

export async function decrementUserCredits(userId: string): Promise<number> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const result = await client.query(
      `UPDATE "user" SET credits = credits - 1 WHERE user_id = $1 RETURNING credits`,
      [userId],
    )
    if (result.rowCount === 0) {
      throw new Error(`User with ID ${userId} not found`)
    }
    const updatedCredits: number = result.rows[0].credits
    return updatedCredits
  } catch (error) {
    throw new Error(`Error updating credits: ${error}`)
  } finally {
    await client.end()
  }
}

export interface User {
  user_id: string
  credits: number
  nickname: string
  name: string
  picture: string
  locale: string
  email: string
}

export async function getUser(userId: string): Promise<User | null> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const { rows, rowCount } = await client.query(
      `SELECT * FROM "user" WHERE user_id = $1`,
      [userId],
    )
    if (rowCount > 1) {
      throw new Error(`Unexpected row count ${rowCount} getting user ${userId}`)
    }
    return rows[0]
  } catch (error) {
    throw new Error(`Error fetching user credits: ${error}`)
  } finally {
    await client.end()
  }
}

export async function setUser(user: User): Promise<void> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const query = `
      INSERT INTO "user" (user_id, credits, nickname, name, picture, locale, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE
      SET credits = EXCLUDED.credits,
          nickname = EXCLUDED.nickname,
          name = EXCLUDED.name,
          picture = EXCLUDED.picture,
          locale = EXCLUDED.locale,
          email = EXCLUDED.email
    `
    const { rowCount } = await client.query(query, [
      user.user_id,
      user.credits,
      user.nickname,
      user.name,
      user.picture,
      user.locale,
      user.email,
    ])
    if (rowCount !== 1) {
      throw new Error(
        `Unexpected row count ${rowCount} adding or updating user ${user.user_id}`,
      )
    }
  } catch (error) {
    throw new Error(`Error updating user credits: ${error}`)
  } finally {
    await client.end()
  }
}

export async function getUserCount(): Promise<number> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const query = 'SELECT COUNT(*) FROM "user"'
    const result = await client.query(query)
    const count = parseInt(result.rows[0].count, 10)
    return count
  } catch (error) {
    throw new Error(`Error counting prompt users: ${error}`)
  } finally {
    await client.end()
  }
}

export async function getStar(
  userId: string,
  promptId: string,
): Promise<boolean> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const { rows } = await client.query(
      `SELECT 1 FROM star WHERE user_id = $1 AND prompt_id = $2 LIMIT 1`,
      [userId, promptId],
    )
    return rows.length > 0
  } catch (error) {
    throw new Error(`Error checking star existence: ${error}`)
  } finally {
    await client.end()
  }
}

export async function setStar(userId: string, promptId: string): Promise<void> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    await client.query(
      `INSERT INTO star (user_id, prompt_id) VALUES ($1, $2)
       ON CONFLICT (user_id, prompt_id) DO NOTHING`,
      [userId, promptId],
    )
  } catch (error) {
    throw new Error(`Error adding star: ${error}`)
  } finally {
    await client.end()
  }
}

export async function unsetStar(
  userId: string,
  promptId: string,
): Promise<void> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    await client.query(
      `DELETE FROM star WHERE user_id = $1 AND prompt_id = $2`,
      [userId, promptId],
    )
  } catch (error) {
    throw new Error(`Error removing star: ${error}`)
  } finally {
    await client.end()
  }
}

export async function getStarCount(): Promise<number> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const query = 'SELECT COUNT(*) FROM star'
    const result = await client.query(query)
    const count = parseInt(result.rows[0].count, 10)
    return count
  } catch (error) {
    throw new Error(`Error counting prompt stars: ${error}`)
  } finally {
    await client.end()
  }
}
