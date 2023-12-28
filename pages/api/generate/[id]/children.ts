import { Prompt, getPrompt, setPrompt } from '@/lib/data'
import { generatePromptChildren } from '@/lib/openai'
import md5 from 'md5'
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
  if (!prompt.body) {
    res.status(401).end()
    return
  }
  const parent =
    (prompt.parent_id && (await getPrompt(prompt.parent_id))) || undefined
  const generatedChildren = await generatePromptChildren(prompt, parent)
  for (var i = 0; i < generatedChildren.length; ++i) {
    const childPromptInput = generatedChildren[i]
    const childId = md5(id + childPromptInput)
    const child: Prompt = {
      prompt_id: childId,
      input: childPromptInput,
      parent_id: id,
      timestamp: new Date().toISOString(),
    }
    await setPrompt(child)
  }
  prompt.timestamp = new Date().toISOString()
  await setPrompt(prompt)
  await res.revalidate(`/${id}`)
  res.status(200).end()
}
