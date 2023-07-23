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

type Prompt = {
  prompt: string
  body?: string
  children?: [{ id: string; prompt: string }]
}

const database: {
  [id: string]: Prompt
} = {
  '1': {
    prompt: 'ancient rome',
    body: 'Ancient Rome was a kingdom, then a republic, then an empire, and then history.',
    children: [
      {
        id: '2',
        prompt: 'Julius Caesar',
      },
    ],
  },
  '2': {
    prompt: 'Julius Caesar',
  },
}

export const listPrompts: () => [string, Prompt][] = () => {
  return Object.entries(database)
}

export const getPrompt: (id: string) => Prompt = (id: string) => {
  return database[id]
}

export const setPrompt: (id: string, prompt: Prompt) => void = (
  id: string,
  prompt: Prompt,
) => {
  database[id] = prompt
}
