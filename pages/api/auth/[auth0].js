import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0'

// export default handleAuth();

export default handleAuth({
  async login(req, res) {
    console.log('req.referer', req.headers.referer)
    await handleLogin(req, res, {
      returnTo: req.headers.referer,
    })
  },
  async logout(req, res) {
    console.log('req.referer', req.headers.referer)
    await handleLogout(req, res, {
      returnTo: '/?homeRedirectTo=' + encodeURIComponent(req.headers.referer),
    })
  },
})
