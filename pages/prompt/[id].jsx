import { useRouter } from 'next/router'
import { getPrompt } from '@/lib/data'
import Link from 'next/link'
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client'
import { useState, useEffect } from 'react'

function Generate({ id, prompt }) {
  const router = useRouter()
  const { user, error, isLoading } = useUser()
  const [credits, setCredits] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generate = async () => {
    try {
      setIsGenerating(true)
      const res = await fetch(`/api/prompt/${id}`)
      if (res.status == 200) {
        setTimeout(() => router.reload(), 500)
      }
    } catch (err) {
      setIsGenerating(false)
      console.log(err)
    }
  }
  useEffect(() => {
    fetch(`/api/credits`).then(async (res) => {
      const data = await res.json()
      if (res.status == 200) {
        setCredits(data)
      }
    })
  })
  if (isLoading) {
    return <div>Loading user...</div>
  }
  if (error) {
    console.error(error)
    return <div>{error.message}</div>
  }
  return (
    <div>
      <h1>Input prompt: {prompt.prompt}</h1>
      <p>
        Parent prompt:{' '}
        {(prompt.parent && <Link href={prompt.parent}>{prompt.parent}</Link>) ||
          'none'}
      </p>
      <p>Not generated, yet.</p>
      {user ? (
        <div>
          <p>Authenticated user: {JSON.stringify(user)}</p>
          {credits > 0 && (
            <p>
              <button onClick={generate} disabled={isGenerating}>
                Generate
              </button>{' '}
              (you have {credits} credits)
            </p>
          )}
          {credits === 0 && <p>No credits!</p>}
          {credits === null && <p>Loading credits...</p>}
          <p>
            <Link href="/api/auth/logout">Logout</Link>
          </p>
        </div>
      ) : (
        <div>
          <p>sign-in required</p>
          <Link href="/api/auth/login">Login</Link>
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
      <h1>Input prompt: {prompt.prompt}</h1>
      <p>Body: {prompt.body}</p>
      <p>Created by user:{JSON.stringify(prompt.user)}</p>
      <p>
        Parent prompt:{' '}
        {(prompt.parent && <Link href={prompt.parent}>{prompt.parent}</Link>) ||
          'none'}
      </p>
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
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps = async ({ params: { id } }) => {
  var prompt = await getPrompt(id)
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
