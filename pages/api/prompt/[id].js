import { LoremIpsum } from 'lorem-ipsum'
import {
  getPrompt,
  setPrompt,
  getUserCredits,
  decrementUserCredits,
} from '@/lib/data'
import md5 from 'md5'
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import { updateSession } from '@auth0/nextjs-auth0'

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
    prompt.body = gen.generateWords(7)
    prompt.children = []
    for (var i = 0; i < 10; ++i) {
      const childPromptInput = gen.generateWords(3)
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
