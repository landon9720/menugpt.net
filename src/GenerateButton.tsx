import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from './GenerateButton.module.css'
import RandomEmoji from './RandomEmoji'

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
        setTimeout(() => {
          router.reload()
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

  const generateEnabled = !isGenerating && !isDoneGenerating

  let generateLabel = <></>
  if (isGenerating) {
    generateLabel = (
      <>
        <RandomEmoji /> Generating, please wait...
      </>
    )
  } else if (errorGenerating) {
    generateLabel = <>😳 Error generating - refresh and try again?</>
  } else if (isDoneGenerating) {
    generateLabel = <>Ready to refresh!</>
  } else {
    switch (generateContentType) {
      case 'body':
        generateLabel = <>✨ Generate body</>
        break
      case 'children':
        generateLabel = <>✨ Generate replies</>
        break
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
