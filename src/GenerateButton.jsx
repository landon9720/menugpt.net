import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function GenerateButton({ id }) {
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
        setTimeout(() => router.reload(), 600)
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
  const buttonLabel = isGenerating ? 'Generating, please wait...' : 'Generate'
  return (
    <p>
      <button onClick={generate} disabled={!generateEnabled}>
        {buttonLabel}
      </button>
      {!isGenerating && (
        <>
          {credits > 0 && <> (you have {credits} credits)</>}
          {credits === 0 && <> (no credits!)</>}
          {user && credits === null && <> (loading credits...)</>}
        </>
      )}
    </p>
  )
}
