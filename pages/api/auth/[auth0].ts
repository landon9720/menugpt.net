import {
  Session,
  handleAuth,
  handleCallback,
  handleLogin,
  handleLogout,
} from '@auth0/nextjs-auth0'

import { getUser, setUser } from '@/lib/data'
import { NEW_USER_CREDITS } from '@/lib/globals'
import { NextApiRequest, NextApiResponse } from 'next'

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
        const user_id = session.user.sub
        let user = await getUser(user_id)
        if (!user) {
          user = {
            user_id,
            credits: NEW_USER_CREDITS,
            nickname: session.user.nickname,
            name: session.user.name,
            picture: session.user.picture,
            locale: session.user.locale,
            email: session.user.email,
          }
          console.log('new user sign-in', user)
        } else {
          user.nickname = session.user.nickname
          user.name = session.user.name
          user.picture = session.user.picture
          user.locale = session.user.locale
          user.email = session.user.email
          console.log('existing user sign-in', user)
        }
        await setUser(user)
        session.credits = user.credits
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
