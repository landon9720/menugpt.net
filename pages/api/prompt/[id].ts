import {
  Prompt,
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
  const generatedBody = await generatePromptBody(prompt.input)
  const generatedChildren = await generatePromptChildren(
    prompt.input,
    generatedBody,
  )
  prompt.body = generatedBody
  for (var i = 0; i < generatedChildren.length; ++i) {
    const childPromptInput = generatedChildren[i]
    const childId = md5(id + childPromptInput)
    const child: Prompt = {
      prompt_id: childId,
      input: childPromptInput,
      parent_id: id,
      timestamp: new Date(),
    }
    await setPrompt(child)
  }
  prompt.user_id = user.sub
  await setPrompt(prompt)
  await res.revalidate(`/${id}`)
  const credits = await decrementUserCredits(user.sub)
  session.credits = credits
  await updateSession(req, res, session)
  res.status(200).end()
})
