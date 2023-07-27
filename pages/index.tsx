import { Prompt, getRecentPrompts, getTopPrompts } from '@/lib/data'
import PromptList from '@/src/PromptList'
import Timestamp from '@/src/Timestamp'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Top from '../src/Top'
import { ChangeEvent, ChangeEventHandler, useState } from 'react'
import styles from './index.module.css'

interface Props {
  top: Prompt[]
  recent: Prompt[]
  timestamp: string
}

export default function Index({ top, recent, timestamp }: Props) {
  const router = useRouter()
  const homeRedirectTo = router.query.homeRedirectTo as string
  type View = 'top' | 'recent'
  const [view, setView] = useState<View>('top')
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
          <option value="top">Top</option>
          <option value="recent">Recent</option>
        </select>
      </p>
      <PromptList prompts={view === 'top' ? top : recent} />
      <Timestamp
        timestamp={timestamp}
        title="When this page was last generated"
      />
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const top = await getTopPrompts()
  const recent = await getRecentPrompts()
  return {
    props: {
      top,
      recent,
      timestamp: new Date().toISOString(),
    },
    revalidate: 60,
  }
}
