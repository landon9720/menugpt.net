import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from './GenerateButton.module.css'

export type GenerateContentType = 'body' | 'children'

export interface GenerateButtonProps {
  id: string
  generateContentType: GenerateContentType
}

export default function GenerateButton({
  id,
  generateContentType,
}: GenerateButtonProps) {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDoneGenerating, setIsDoneGenerating] = useState(false)
  const [errorGenerating, setErrorGenerating] = useState(false)

  const generate = async () => {
    if (!user) {
      router.push('/api/auth/login')
    } else {
      try {
        setIsGenerating(true)
        const res = await fetch(`/api/generate/${id}/${generateContentType}`)
        setIsGenerating(false)
        setIsDoneGenerating(true)
        if (res.status == 200) {
          setTimeout(() => router.reload(), 1000)
        } else {
          setErrorGenerating(true)
        }
      } catch (err) {
        setIsGenerating(false)
        setErrorGenerating(true)
        console.log(err)
      }
    }
  }

  useEffect(() => {
    if (!isLoading) {
      fetch('/api/credits').then(async (res) => {
        if (res.status === 200) {
          const data = await res.json()
          setCredits(data)
        }
      })
    }
  }, [isLoading])

  const hasCredits = credits && credits > 0
  const generateEnabled =
    !isLoading && ((hasCredits && !isGenerating && !isDoneGenerating) || !user)

  let generateLabel = ''
  if (isGenerating) {
    generateLabel = 'Generating, please wait...'
  } else if (errorGenerating) {
    generateLabel = 'Error generating :-( Refresh and try again?'
  } else if (isDoneGenerating) {
    generateLabel = 'Ready to refresh!'
  } else {
    switch (generateContentType) {
      case 'body':
        generateLabel = '✨ Generate body'
        break
      case 'children':
        generateLabel = '✨ Generate replies'
        break
    }
    if (user && !hasCredits) {
      generateLabel += ' (no credits!)'
    }
  }

  return (
    <p className={styles.generate}>
      <button onClick={generate} disabled={!generateEnabled}>
        {generateLabel}
      </button>
    </p>
  )
}
