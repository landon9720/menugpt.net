import styles from './Star.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Star({ promptId }: { promptId: string }) {
  const router = useRouter()
  const { user } = useUser()
  const [isStarred, setIsStarred] = useState<boolean | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)

  const onClick = async () => {
    const url = `/api/star/${promptId}/${isStarred ? 'unset' : 'set'}`
    fetch(url).then(async (res) => {
      try {
        if (res.status === 200) {
          setIsStarred(!isStarred)
        }
      } catch (err) {
        console.log(err)
      } finally {
        setIsRequesting(false)
      }
    })
  }

  useEffect(() => {
    fetch(`/api/star/${promptId}`).then(async (res) => {
      if (res.status === 200) {
        const data = await res.json()
        console.log('star', data)
        setIsStarred(data)
      }
    })
  })

  const title = isStarred
    ? 'Your star means you like it - click to remove star'
    : 'Star it if you like it - click to add your star'

  return (
    user && (
      <button
        className={styles.star}
        disabled={!user || isRequesting}
        onClick={onClick}
        title={title}
      >
        {(isStarred && <>&#127775;</>) || <>&#9734;</>}
      </button>
    )
  )
}
