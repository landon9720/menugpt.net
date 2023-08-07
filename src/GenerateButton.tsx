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
  const afterLogin = router.query.afterLogin
  const { user, isLoading: isLoadingUser } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [isLoadingCredits, setIsLoadingCredits] = useState(false)
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
          setTimeout(() => {
            if (!afterLogin) {
              router.reload()
            } else {
              router.replace(id)
            }
          }, 1000)
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
    if (!isLoadingUser) {
      setIsLoadingCredits(true)
      fetch('/api/credits')
        .then(async (res) => {
          if (res.status === 200) {
            const data = await res.json()
            setCredits(data)
            if (afterLogin) {
              generate()
            }
          }
        })
        .finally(() => setIsLoadingCredits(false))
    }
  }, [isLoadingUser])

  const hasCredits = credits && credits > 0
  const generateEnabled =
    !isLoadingUser &&
    !isLoadingCredits &&
    ((hasCredits && !isGenerating && !isDoneGenerating) || !user)

  let generateLabel = ''
  if (isGenerating) {
    generateLabel = '✨ Generating, please wait...'
  } else if (errorGenerating) {
    generateLabel = '😳 Error generating - refresh and try again?'
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
    if (user && !isLoadingCredits && !hasCredits) {
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
