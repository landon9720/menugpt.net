import {
  Prompt,
  decrementUserCredits,
  getPrompt,
  getUser,
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
  const user = await getUser(session.user.sub)
  if (!user?.credits) {
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
  const parent =
    (prompt.parent_id && (await getPrompt(prompt.parent_id))) || undefined
  prompt.body = await generatePromptBody(prompt.input, parent)
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
  prompt.user_id = user.user_id
  prompt.timestamp = new Date().toISOString()
  await setPrompt(prompt)
  await res.revalidate(`/${id}`)
  const credits = await decrementUserCredits(user.user_id)
  session.credits = credits
  await updateSession(req, res, session)
  res.status(200).end()
})
