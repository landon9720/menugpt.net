import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { BODY_SYSTEM_PROMPT, SUGGESTION_SYSTEM_PROMPT } from './globals'
import { Prompt } from './data'

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  }),
)

async function callOpenAiApi(
  messages: ChatCompletionRequestMessage[],
): Promise<string> {
  const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 1.2, // 0-2
    n: 1, // number of choices
    max_tokens: 250, // number of tokens to generate
  })
  const result = chatCompletion.data.choices[0].message?.content
  if (!result) {
    throw new Error('Missing result message')
  }
  return result
}

export async function generatePromptBody(
  input: string,
  parent?: Prompt,
): Promise<string> {
  const messages: ChatCompletionRequestMessage[] = []
  if (parent) {
    messages.push({
      role: 'user',
      content: parent.input,
    })
    messages.push({
      role: 'assistant',
      content: parent.body,
    })
  }
  messages.push({
    role: 'user',
    content: input,
  })
  messages.push({
    role: 'system',
    content: BODY_SYSTEM_PROMPT,
  })
  const body = await callOpenAiApi(messages)
  return body
}

export async function generatePromptChildren(
  prompt: Prompt,
  parent?: Prompt,
): Promise<string[]> {
  const messages: ChatCompletionRequestMessage[] = []
  if (parent) {
    messages.push({
      role: 'user',
      content: parent.input,
    })
    messages.push({
      role: 'assistant',
      content: parent.body,
    })
  }
  messages.push({
    role: 'user',
    content: prompt.input,
  })
  messages.push({
    role: 'assistant',
    content: prompt.body,
  })
  messages.push({
    role: 'system',
    content: SUGGESTION_SYSTEM_PROMPT,
  })
  const options = await callOpenAiApi(messages)
  return postProcessOptions(options)
}

function postProcessOptions(options: string) {
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
