import {
  Prompt,
  getGeneratedPromptCount,
  getRecentPrompts,
  getStarCount,
  getTopPrompts,
  getUserCount,
} from '@/lib/data'
import PromptList from '@/src/PromptList'
import Timestamp from '@/src/Timestamp'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ChangeEvent, useState } from 'react'
import Top from '../src/Top'
import styles from './index.module.css'

interface Props {
  top: Prompt[]
  recent: Prompt[]
  promptCount: number
  userCount: number
  starCount: number
  timestamp: string
}

export default function Index({
  top,
  recent,
  timestamp,
  promptCount,
  userCount,
  starCount,
}: Props) {
  const router = useRouter()
  const homeRedirectTo = router.query.homeRedirectTo as string
  type View = 'new' | 'top'
  const [view, setView] = useState<View>('new')
  const go = (event: ChangeEvent<HTMLSelectElement>) => {
    setView(event.target.value as View)
  }
  if (homeRedirectTo) {
    router.replace(homeRedirectTo)
  }
  return (
    <>
      <Top text={'Welcome to MenuGpt.net'} />
      <p>
        <Link href="faq">Frequently asked questions (FAQ)</Link>
      </p>
      <p>
        <select className={styles.view} onChange={go}>
          <option value="new">New</option>
          <option value="top">Top</option>
        </select>
      </p>
      <PromptList prompts={view === 'top' ? top : recent} />
      <p>
        MenuGpt.net has {promptCount} pages, with {starCount} stars, generated
        by {userCount} users.
      </p>
      <Timestamp
        timestamp={timestamp}
        title="When this page was last generated"
      />
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const [top, recent, promptCount, userCount, starCount] = await Promise.all([
    getTopPrompts(),
    getRecentPrompts(),
    getGeneratedPromptCount(),
    getUserCount(),
    getStarCount(),
  ])
  return {
    props: {
      top,
      recent,
      promptCount,
      userCount,
      starCount,
      timestamp: new Date().toISOString(),
    },
    revalidate: 60,
  }
}
