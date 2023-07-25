import {
  handleAuth,
  handleCallback,
  handleLogin,
  handleLogout,
} from '@auth0/nextjs-auth0'

import { getUserCredits, setUserCredits } from '@/lib/data'

const NEW_USER_CREDITS = 10

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
  async logout(req, res) {
    console.log('req.referer', req.headers.referer)
    await handleLogout(req, res, {
      returnTo: '/?homeRedirectTo=' + encodeURIComponent(req.headers.referer),
    })
  },
})
