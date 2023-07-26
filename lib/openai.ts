import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  }),
)

export async function generatePromptBody(promptInput: string): Promise<string> {
  const bodySystemPrompt = [
    'Provide an article, essay, blog-post, or comment.',
    'Be brief, informative, on-topic.',
    'Optionally include subtle humor, puns, and non-sequiturs.',
    'Produce 1-2 short paragraphs with 1-4 sentences each.',
  ].join(' ')
  const body = await callOpenAiApi([
    {
      role: 'user',
      content: promptInput,
    },
    {
      role: 'system',
      content: bodySystemPrompt,
    },
  ])
  return body
}

export async function generatePromptChildren(
  promptInput: string,
  promptBody: string,
): Promise<string[]> {
  const suggestionSystemPrompt = [
    'Provide a menu of options.',
    'Each option is a choice the user may select to continue this conversation.',
    'Each option can be serious, practical, humorous, unexpected, whimsical, comedic, or punny.',
    'Each option can be on topic, tangential, related, unrelated, generalizations, or specializations.',
    'Each option must be brief.',
    'Provide options for the next message to be sent by the user.',
  ].join(' ')
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
      content: suggestionSystemPrompt,
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
