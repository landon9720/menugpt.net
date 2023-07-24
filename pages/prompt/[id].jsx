import { useRouter } from 'next/router'
import { getPrompt } from '@/lib/data'
import Link from 'next/link'
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client'

function Generate({ id, prompt }) {
  const router = useRouter()
  const { user, error, isLoading } = useUser()
  console.log('user', user)
  const generate = async () => {
    try {
      const res = await fetch(`/api/prompt/${id}`)
      const data = await res.body
      console.log(data)
      router.reload()
    } catch (err) {
      console.log(err)
    }
  }
  if (isLoading) {
    return <div>Loading user...</div>
  }
  if (error) {
    console.error(error)
    return <div>{error.message}</div>
  }
  return (
    <div>
      <h1>{prompt.prompt}</h1>
      <p>Not generated, yet.</p>
      {user ? (
        <div>
          <p>{JSON.stringify(user)}</p>
          <p>
            <button onClick={generate}>Generate</button>
          </p>
          <p>
            <a href="/api/auth/logout">Logout</a>
          </p>
        </div>
      ) : (
        <div>
          <p>sign-in required</p>
          <a href="/api/auth/login">Login</a>
        </div>
      )}
    </div>
  )
}

export default function Page({ id, prompt }) {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }
  if (!prompt.body) {
    return (
      <UserProvider>
        <Generate id={id} prompt={prompt} />
      </UserProvider>
    )
  }
  return (
    <div>
      <h1>{prompt.prompt}</h1>
      <p>{prompt.body}</p>
      <p>Do you want to know more?</p>
      <ol>
        {prompt.children.map((child) => (
          <li key={child.id}>
            <Link href={child.id}>{child.prompt}</Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

export const getStaticPaths = async () => {
  return {
    paths: [{ params: { id: '1' } }],
    fallback: true,
  }
}

export const getStaticProps = async ({ params: { id } }) => {
  var prompt = await getPrompt(id)
  console.log('prompt', prompt)
  if (!prompt) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      id,
      prompt,
    },
  }
}
