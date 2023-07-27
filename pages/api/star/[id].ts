import { getStar } from '@/lib/data'
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0'
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
  const userId = session.user.sub
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    res.status(400).end()
    return
  }
  const star = await getStar(userId, id)
  res.status(200).json(star)
})
