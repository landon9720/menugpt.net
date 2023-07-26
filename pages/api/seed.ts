import { getPrompt, setPrompt } from '@/lib/data'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const existing = await getPrompt('1')
  if (!existing) {
    await setPrompt('1', {
      prompt: 'Existence',
    })
    res.revalidate('/prompt/1')
  }
  res.status(200).end()
}
