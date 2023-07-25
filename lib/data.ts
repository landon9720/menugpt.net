import { createClient } from 'redis'

const db = createClient({
  url: process.env.KV_URL,
  socket: { tls: process.env.KV_TLS === 'true' },
})
db.on('error', (err) => console.error('Redis Client Error', err))
db.connect()

export function colors(): string[] {
  return [
    'green',
    'yellow',
    'blue',
    'purple',
    'pink',
    'orange',
    'lavender',
    'puce',
  ]
}

export interface Prompt {
  prompt: string
  body?: string
  children?: [{ id: string; prompt: string }]
  user?: any
  parent?: string
}

function promptKey(id: string): string {
  return `prompt:${id}`
}

export const getPrompt: (id: string) => Promise<Prompt | null> = async (
  id: string,
) => {
  const json: string | null = await db.get(promptKey(id))
  if (json) {
    return JSON.parse(json) as Prompt
  }
  return null
}

export const setPrompt: (id: string, prompt: Prompt) => Promise<void> = async (
  id: string,
  prompt: Prompt,
) => {
  const json = JSON.stringify(prompt)
  await db.set(promptKey(id), json)
}

function userCreditsKey(id: string): string {
  return `credits:${id}`
}

export const getUserCredits: (id: string) => Promise<number | null> = async (
  id: string,
) => {
  const json: string | null = await db.get(userCreditsKey(id))
  if (json) {
    return JSON.parse(json) as number
  }
  return null
}

export const incrementUserCredits: (
  id: string,
  quantity: number,
) => Promise<number> = async (id: string, quantity: number) => {
  return await db.incrBy(userCreditsKey(id), quantity)
}

export const decrementUserCredits: (id: string) => Promise<number> = async (
  id: string,
) => {
  return db.decrBy(userCreditsKey(id), 1)
}
