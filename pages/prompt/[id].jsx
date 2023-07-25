import { useRouter } from 'next/router'
import { getPrompt } from '@/lib/data'
import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useState, useEffect } from 'react'
import TimeAgo from 'javascript-time-ago'
import styles from './prompt.module.css'

function Generate({ id }) {
  const router = useRouter()
  const { user, error: userError, isLoading: isLoadingUser } = useUser()
  const [credits, setCredits] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  if (userError) {
    console.error('User error', error)
  }

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
    if (!isLoadingUser) {
      fetch(`/api/credits`).then(async (res) => {
        const data = await res.json()
        if (res.status == 200) {
          setCredits(data)
        }
      })
    }
  })
  return (
    <div>
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
        <p>
          <Link href="/api/auth/login">sign-in required</Link>
        </p>
      )}
    </div>
  )
}

TimeAgo.addDefaultLocale(en)
import en from 'javascript-time-ago/locale/en'
const timeAgo = new TimeAgo('en-US')

export default function Page({ id, prompt }) {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }
  const { prompt: promptText, body, user, parent, children, timestamp } = prompt
  return (
    <div>
      <h1>{promptText}</h1>
      {parent && (
        <p>
          Parent: <Link href={parent}>{parent}</Link>
        </p>
      )}
      {body && <p>{body}</p>}
      {!body && <p>Not generated, yet.</p>}
      {!body && <Generate id={id} />}
      {user && (
        <>
          <p>
            By: {user.nickname}
            <img className={styles.avatar} src={user.picture} alt="Avatar" />
            {timestamp && <>{timeAgo.format(new Date(timestamp))}</>}
          </p>
        </>
      )}
      {children && (
        <ol>
          {prompt.children.map((child) => (
            <li key={child.id}>
              <Link href={child.id}>{child.prompt}</Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
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
