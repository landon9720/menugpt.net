import { Prompt, searchPrompts } from '@/lib/data'
import { withApiAuthRequired } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 50, maxKeys: 1000 })

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    let userInput = req.query.q as string
    if (!userInput) {
      res.status(401).end()
    }
    userInput = userInput.slice(0, 100)
    let result = cache.get<Prompt[]>(userInput)
    if (!result) {
      result = await searchPrompts(userInput)
      cache.set(userInput, result)
    }
    res.status(200).json(result)
  },
)
