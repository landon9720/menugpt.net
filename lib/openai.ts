import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { BODY_SYSTEM_PROMPT, SUGGESTION_SYSTEM_PROMPT } from './globals'

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  }),
)

export async function generatePromptBody(promptInput: string): Promise<string> {
  const body = await callOpenAiApi([
    {
      role: 'user',
      content: promptInput,
    },
    {
      role: 'system',
      content: BODY_SYSTEM_PROMPT,
    },
  ])
  return body
}

export async function generatePromptChildren(
  promptInput: string,
  promptBody: string,
): Promise<string[]> {
  const options = await callOpenAiApi([
    {
      role: 'user',
      content: promptInput,
    },
    {
      role: 'assistant',
      content: promptBody,
    },
    {
      role: 'system',
      content: SUGGESTION_SYSTEM_PROMPT,
    },
  ])
  return options.split('\n').flatMap((line) => {
    // Remove leading list numbering
    if (/^\d+\.\s+/.test(line)) {
      line = line.replace(/^\d+\.\s+/, '')
    }
    // Remove quotes
    if (line.startsWith('"') && line.endsWith('"')) {
      line = line.slice(1, -1)
    }
    // Remove whitespace
    line = line.trim()
    // Only use nonempty strings
    if (line.length) {
      return [line]
    } else {
      return []
    }
  })
}

async function callOpenAiApi(
  messages: ChatCompletionRequestMessage[],
): Promise<string> {
  const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 1.0, // 0-2
    n: 1, // number of choices
    max_tokens: 300, // number of tokens to generate
  })
  const result = chatCompletion.data
  const message = result.choices[0].message?.content
  if (!message) {
    throw new Error('Missing message')
  }
  return message
}
