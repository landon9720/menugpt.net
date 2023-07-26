import { getPrompt } from '@/lib/data'
import { useUser } from '@auth0/nextjs-auth0/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Top from '../Top'
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
  const generateEnabled = user && !isLoadingUser && credits > 0 && !isGenerating
  return (
    <p>
      <button onClick={generate} disabled={!generateEnabled}>
        Generate
      </button>
      {credits > 0 && <> (you have {credits} credits)</>}
      {credits === 0 && <> No credits!</>}
      {user && credits === null && <> Loading credits...</>}
    </p>
  )
}

export function Avatar({ user }) {
  const { picture, nickname } = user
  return (
    <>
      <img className={styles.avatar} src={picture} alt="Avatar" />
      {nickname}
    </>
  )
}

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

export default function Page({ id, prompt }) {
  const router = useRouter()
  if (router.isFallback) {
    return <p>Loading...</p>
  }
  const { prompt: promptText, body, user, parent, children, timestamp } = prompt
  return (
    <div>
      {parent && (
        <p>
          <Link href={parent}>[&#8593; parent]</Link>
        </p>
      )}
      <Top text={promptText} />
      {body && <p>{body}</p>}
      {!body && (
        <p className={styles.notGeneratedYet}>
          This page&apos;s content has not been generated, yet.
        </p>
      )}
      {!body && <Generate id={id} />}
      {user && (
        <p>
          by <Avatar user={user} />
          {timestamp && <> at {new Date(timestamp).toUTCString()}</>}
        </p>
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
      <UserAuth />
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
