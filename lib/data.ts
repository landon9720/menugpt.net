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
      `INSERT INTO prompt (prompt_id, body, input, parent_id, timestamp)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (prompt_id) DO UPDATE
       SET body = EXCLUDED.body,
           input = EXCLUDED.input,
           parent_id = EXCLUDED.parent_id,
           timestamp = EXCLUDED.timestamp`,
      [
        prompt.prompt_id,
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
