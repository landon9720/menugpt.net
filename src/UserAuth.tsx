import { useUser } from '@auth0/nextjs-auth0/client'
import Link from 'next/link'
import Avatar from './Avatar'

export default function UserAuth() {
  const { user, isLoading } = useUser()
  if (isLoading) {
    return <p>Loading...</p>
  }
  return (
    <footer>
      {!user && (
        <p>
          <Link
            href="/api/auth/login"
            title="Sign-in is required to generate content and star pages"
          >
            [&#8594; sign-in]
          </Link>
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
