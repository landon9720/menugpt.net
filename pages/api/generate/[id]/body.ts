import { getPrompt, setPrompt } from '@/lib/data'
import { generatePromptBody } from '@/lib/openai'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    res.status(400).end()
    return
  }
  const prompt = await getPrompt(id)
  if (!prompt) {
    res.status(404).end()
    return
  }
  if (prompt.body) {
    res.status(200).end()
    return
  }
  const parent =
    (prompt.parent_id && (await getPrompt(prompt.parent_id))) || undefined
  prompt.body = await generatePromptBody(prompt.input, parent)
  prompt.timestamp = new Date().toISOString()
  await setPrompt(prompt)
  await res.revalidate(`/${id}`)
  res.status(200).end()
}
