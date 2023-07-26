import {
  Session,
  handleAuth,
  handleCallback,
  handleLogin,
  handleLogout,
} from '@auth0/nextjs-auth0'

import { getUserCredits, setUserCredits } from '@/lib/data'
import { NextApiRequest, NextApiResponse } from 'next'

const NEW_USER_CREDITS = 100

export default handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    await handleLogin(req, res, {
      returnTo: req.headers.referer,
    })
  },
  async callback(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    await handleCallback(req, res, {
      afterCallback: async function (
        _1: NextApiRequest,
        _2: NextApiResponse,
        session: Session,
      ): Promise<Session> {
        const userId = session.user.sub
        let credits = await getUserCredits(userId)
        if (credits === null) {
          console.log('new user sign-in', session.user)
          credits = NEW_USER_CREDITS
          await setUserCredits(userId, credits)
        } else {
          console.log('existing user sign-in', session.user, 'credits', credits)
        }
        session.credits = credits
        return session
      },
    })
  },
  async logout(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const ref = req.headers.referer
    const returnTo = ref ? '/?homeRedirectTo=' + encodeURIComponent(ref) : '/'
    await handleLogout(req, res, {
      returnTo,
    })
  },
})
