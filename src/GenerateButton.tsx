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
  const { user, isLoading: isLoadingUser } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDoneGenerating, setIsDoneGenerating] = useState(false)
  const [errorGenerating, setErrorGenerating] = useState(false)

  const generate = async () => {
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
      console.log(err)
    }
  }

  useEffect(() => {
    if (!isLoadingUser) {
      fetch('/api/credits').then(async (res) => {
        if (res.status === 200) {
          const data = await res.json()
          setCredits(data)
        }
      })
    }
  }, [isLoadingUser])

  let creditInfo = 'loading credits...'
  if (credits && credits > 0) {
    creditInfo = `you have ${credits.toLocaleString()} credits`
  } else if (credits === 0) {
    creditInfo = 'no credits!'
  }
  const generateEnabled =
    credits && credits > 0 && !isGenerating && !isDoneGenerating
  let generateLabel: String = ''
  switch (generateContentType) {
    case 'body':
      generateLabel = `Generate body for 1 credit (${creditInfo})`
      break
    case 'children':
      generateLabel = `Generate replies for 1 credit (${creditInfo})`
      break
  }
  if (isGenerating) {
    generateLabel = 'Generating, please wait...'
  } else if (errorGenerating) {
    generateLabel = 'Error generating :-( Sign-out, then in, and try again?'
  } else if (isDoneGenerating) {
    generateLabel = 'Ready to refresh!'
  }
  return (
    user && (
      <p>
        <button
          className={styles.generate}
          onClick={generate}
          disabled={!generateEnabled}
        >
          {generateLabel}
        </button>
      </p>
    )
  )
}
