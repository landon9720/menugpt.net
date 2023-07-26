import { useUser } from '@auth0/nextjs-auth0/client'
import Link from 'next/link'
import { Avatar } from './Avatar'

export function UserAuth() {
  const { user, error, isLoading } = useUser()
  if (isLoading) {
    return <p>Loading...</p>
  }
  if (error) {
    console.error('user error', error)
  }
  return (
    <footer>
      {!user && (
        <p>
          <Link href="/api/auth/login">[&#8594; sign-in]</Link> to generate
          content
        </p>
      )}
      {user && (
        <p>
          signed-in as <Avatar user={user} />{' '}
          <Link href="/api/auth/logout">[&#8592; sign-out]</Link>
        </p>
      )}
    </footer>
  )
}
