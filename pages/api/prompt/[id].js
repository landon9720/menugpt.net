import {
  decrementUserCredits,
  getPrompt,
  getUserCredits,
  setPrompt,
} from '@/lib/data'
import {
  getSession,
  updateSession,
  withApiAuthRequired,
} from '@auth0/nextjs-auth0'
import { LoremIpsum } from 'lorem-ipsum'
import md5 from 'md5'

const gen = new LoremIpsum()

export default withApiAuthRequired(async function handler(req, res) {
  const session = await getSession(req, res)
  const user = session.user
  const { id } = req.query
  const prompt = await getPrompt(id)
  if (!prompt) {
    res.status(404).end()
    return
  }
  const userCredits = await getUserCredits(user.sub)
  if (!userCredits) {
    console.log('no credits')
    res.status(401).end()
    return
  }
  if (!prompt.body) {
    prompt.body = gen.generateWords(37)
    prompt.children = []
    for (var i = 0; i < 10; ++i) {
      const childPromptInput = gen.generateWords(8)
      const childId = md5(childPromptInput)
      const child = {
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
  }
  res.status(200).end()
})
