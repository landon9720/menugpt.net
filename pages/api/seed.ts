import { setPrompt } from '@/lib/data'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  await setPrompt('1', {
    prompt: 'Existence',
  })
  res.status(200).end()
}
