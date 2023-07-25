import {
  handleAuth,
  handleCallback,
  handleLogin,
  handleLogout,
} from '@auth0/nextjs-auth0'

import { getUserCredits, incrementUserCredits } from '@/lib/data'

export default handleAuth({
  async login(req, res) {
    console.log('req.referer', req.headers.referer)
    await handleLogin(req, res, {
      returnTo: req.headers.referer,
    })
  },
  async callback(req, res) {
    await handleCallback(req, res, {
      afterCallback: async function (req, res, session) {
        const userId = session.user.sub
        const credits = await getUserCredits(userId)
        if (credits === null) {
          console.log('new user', session.user)
          const credits = await incrementUserCredits(userId, 5)
        } else {
          console.log('existing user', session.user, 'credits', credits)
        }
        session.credits = credits
        return session
      },
    })
  },
  async logout(req, res) {
    console.log('req.referer', req.headers.referer)
    await handleLogout(req, res, {
      returnTo: '/?homeRedirectTo=' + encodeURIComponent(req.headers.referer),
    })
  },
})
