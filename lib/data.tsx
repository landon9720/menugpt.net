import { Client } from 'pg'

const dbConfig = {
  host: '127.0.0.1',
  port: 5432,
  database: 'landon9720',
  user: 'landon9720',
  password: 'landon9720',
}

export interface Prompt {
  prompt_id: string
  user_id?: string
  body?: string
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
      `INSERT INTO prompt (prompt_id, user_id, body, input, parent_id, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (prompt_id) DO UPDATE
       SET user_id = EXCLUDED.user_id,
           body = EXCLUDED.body,
           input = EXCLUDED.input,
           parent_id = EXCLUDED.parent_id,
           timestamp = EXCLUDED.timestamp`,
      [
        prompt.prompt_id,
        prompt.user_id,
        prompt.body,
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

export interface ChildPrompt {
  prompt_id: string
  input: string
}

export async function getPromptChildren(
  parentPromptId: string,
): Promise<ChildPrompt[]> {
  const client = new Client(dbConfig)
  await client.connect()
  try {
    const { rows } = await client.query<ChildPrompt>(
      `SELECT prompt_id, input
       FROM prompt
       WHERE parent_id = $1`,
      [parentPromptId],
    )
    return rows
  } catch (error) {
    throw new Error(`Error fetching children of prompt: ${error}`)
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
          locale = EXCLUDED.picture,
          email = EXCLUDED.picture
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
        `Unexpected row count ${rowCount} adding or updating user ${userId}`,
      )
    }
  } catch (error) {
    throw new Error(`Error updating user credits: ${error}`)
  } finally {
    await client.end()
  }
}
