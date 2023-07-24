import { createClient } from 'redis'

const db = createClient()
db.on('error', (err) => console.log('Redis Client Error', err))
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
  children?: [{ id: string; prompt: string }],
  user?: any
}

// const database: {
//   [id: string]: Prompt
// } = {
//   '1': {
//     prompt: 'ancient rome',
//     body: 'Ancient Rome was a kingdom, then a republic, then an empire, and then history.',
//     children: [
//       {
//         id: '2',
//         prompt: 'Julius Caesar',
//       },
//     ],
//   },
//   '2': {
//     prompt: 'Julius Caesar',
//   },
// }

// export const listPrompts: () => [string, Prompt][] = () => {
//   return Object.entries(database)
// }

// export const getPrompt: (id: string) => Prompt = (id: string) => {
//   return database[id]
// }

// export const setPrompt: (id: string, prompt: Prompt) => void = (
//   id: string,
//   prompt: Prompt,
// ) => {
//   database[id] = prompt
// }

// export const listPrompts: () => Promise<
//   [string, Prompt][]
// > = async () => {
//   const keys: string[] = await kv.keys('*')
//   const keyValues: Promise<[string, Prompt | null]>[] = keys.map<
//     Promise<[string, Prompt | null]>
//   >(async (key: string) => {
//     const value: Prompt | null = await kv.get<Prompt>(key)
//     return [key, value];
//   })
//   return (await Promise.all(keyValues)).filter(
//     ([_, value]) => value !== null
//   ) as [string, Prompt][];
// }

export const getPrompt: (id: string) => Promise<Prompt | null> = async (
  id: string,
) => {
  const json: string | null = await db.get(id)
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
  await db.set(id, json)
}
