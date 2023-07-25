import { useRouter } from 'next/router'
import { getPrompt } from '@/lib/data'
import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useState, useEffect } from 'react'
import styles from './prompt.module.css'
import Image from 'next/image'

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
    <div>
      <button onClick={generate} disabled={!generateEnabled}>
        Generate
      </button>
      {credits > 0 && <> (you have {credits} credits)</>}
      {credits === 0 && <>No credits!</>}
      {user && credits === null && <>Loading credits...</>}
    </div>
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
    return <div>Loading...</div>
  }
  if (error) {
    console.error('user error', error)
  }
  return (
    <div>
      {!user && (
        <p>
          <Link href="/api/auth/login">sign-in</Link> to generate content
        </p>
      )}
      {user && (
        <p>
          signed-in as <Avatar user={user} />{' '}
          <Link href="/api/auth/logout">sign-out</Link>
        </p>
      )}
    </div>
  )
}

export default function Page({ id, prompt }) {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }
  const { prompt: promptText, body, user, parent, children, timestamp } = prompt
  return (
    <div>
      <h1>
        <Image
          className={styles.gopher}
          src="/gopher.png"
          width={940}
          height={940}
        />
        {promptText}
      </h1>
      {body && <p>{body}</p>}
      {!body && <p>Not generated, yet.</p>}
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
      {parent && (
        <p>
          Parent: <Link href={parent}>{parent}</Link>
        </p>
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
