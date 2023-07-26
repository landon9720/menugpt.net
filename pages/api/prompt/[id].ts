import {
  decrementUserCredits,
  getPrompt,
  getUserCredits,
  setPrompt,
} from '@/lib/data'
import { generatePromptBody, generatePromptChildren } from '@/lib/openai'
import {
  getSession,
  updateSession,
  withApiAuthRequired,
} from '@auth0/nextjs-auth0'
import md5 from 'md5'
import { NextApiRequest, NextApiResponse } from 'next'

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const session = await getSession(req, res)
  if (!session) {
    res.status(401).end()
    return
  }
  const user = session.user
  const userCredits = await getUserCredits(user.sub)
  if (!userCredits) {
    res.status(401).end()
    return
  }
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
    res.status(400).end()
    return
  }
  const generatedBody = await generatePromptBody(prompt.prompt)
  const generatedChildren = await generatePromptChildren(
    prompt.prompt,
    generatedBody,
  )
  prompt.body = generatedBody
  prompt.children = []
  for (var i = 0; i < generatedChildren.length; ++i) {
    const childPromptInput = generatedChildren[i]
    const childId = md5(id + childPromptInput)
    const child: { id: string; prompt: string; parent: string } = {
      id: childId,
      prompt: childPromptInput,
      parent: id,
    }
    prompt.children[i] = child
    await setPrompt(childId, child)
  }
  prompt.user = user
  prompt.timestamp = new Date().toISOString()
  await setPrompt(id, prompt)
  await res.revalidate(`/prompt/${id}`)
  const credits = await decrementUserCredits(user.sub)
  session.credits = credits
  await updateSession(req, res, session)
  res.status(200).end()
})
