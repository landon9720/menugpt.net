import { Prompt, getGeneratedPromptCount, getRecentPrompts } from '@/lib/data'
import PromptList from '@/src/PromptList'
import Timestamp from '@/src/Timestamp'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NodeCache from 'node-cache'
import { ChangeEvent, FormEvent, useState } from 'react'
import Top from '../src/Top'
import styles from './index.module.css'

interface Props {
  recent: Prompt[]
  promptCount: number
  timestamp: string
}

export default function Index({ recent, timestamp, promptCount }: Props) {
  const router = useRouter()
  const homeRedirectTo = router.query.homeRedirectTo as string
  if (homeRedirectTo) {
    router.replace(homeRedirectTo)
  }
  type View = 'new' | 'top' | 'search'
  const [view, setView] = useState<View>('new')
  const go = (event: ChangeEvent<HTMLSelectElement>) => {
    setView(event.target.value as View)
    setUserInput('')
  }
  const [userInput, setUserInput] = useState('')
  const [searchResults, setSearchResults] = useState<Prompt[] | null>(null)
  const updateUserInputState = (event: ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value)
    if (view !== 'search') {
      setView('search')
    }
  }
  const [isSearching, setIsSearching] = useState(false)
  const formSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fetchSearch = async () => {
      try {
        setIsSearching(true)
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(userInput)}`,
        )
        const data = await response.json()
        setSearchResults(data)
      } catch (error) {
        console.error('Error fetching search results:', error)
      } finally {
        setIsSearching(false)
      }
    }
    if (!isSearching) {
      if (userInput !== '') {
        fetchSearch()
      } else {
        setSearchResults([])
      }
    }
  }

  let promptsInView: Prompt[] = []
  switch (view) {
    case 'new':
      promptsInView = recent
      break
    case 'search':
      promptsInView = searchResults || []
  }

  return (
    <>
      <Top text={'Welcome to MenuGpt.net'} />
      <select className={styles.view} onChange={go} value={view}>
        <option value="new">New</option>
        <option value="search">Search</option>
      </select>
      <form className={styles.search} onSubmit={formSubmit}>
        <input
          className={styles.q}
          type="search"
          value={userInput}
          onChange={updateUserInputState}
          placeholder="Search"
          disabled={isSearching}
        />
      </form>
      <PromptList prompts={promptsInView} />
      {view !== 'search' && (
        <p>MenuGpt.net has {promptCount.toLocaleString()} pages.</p>
      )}
      {view === 'search' && searchResults !== null && (
        <p>{searchResults.length} search results</p>
      )}
      <p>
        <Link href="faq">Frequently asked questions (FAQ)</Link>
      </p>
      <Timestamp
        timestamp={timestamp}
        title="When this page was last generated"
      />
    </>
  )
}

const cache = new NodeCache({ stdTTL: 50, maxKeys: 1000 })
const cacheKey = 'props'

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  let props = cache.get<Props>(cacheKey)
  if (!props) {
    const [recent, promptCount] = await Promise.all([
      getRecentPrompts(),
      getGeneratedPromptCount(),
    ])
    props = {
      recent,
      promptCount,
      timestamp: new Date().toISOString(),
    }
    cache.set('props', props)
  }
  return {
    props,
  }
}
