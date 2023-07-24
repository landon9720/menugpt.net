import { LoremIpsum } from 'lorem-ipsum'
import { getPrompt, setPrompt } from '@/lib/data'
import md5 from 'md5'
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'

const gen = new LoremIpsum()

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res)
  const { id } = req.query
  var prompt = await getPrompt(id)
  if (!prompt) {
    return {
      notFound: true,
    }
  }
  if (!prompt.body) {
    prompt.body = gen.generateWords(7)
    prompt.children = []
    for (var i = 0; i < 10; ++i) {
      const childPromptInput = gen.generateWords(3)
      const id = md5(childPromptInput)
      const child = {
        id,
        prompt: childPromptInput,
      }
      prompt.children[i] = child
      await setPrompt(id, child)
    }
    prompt.user = user
    console.log('new prompt', prompt)
    await setPrompt(id, prompt)
    await res.revalidate(`/prompt/${id}`)
  }
  res.status(200).end()
})
