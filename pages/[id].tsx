import { Prompt, getPrompt, getPromptChildren } from '@/lib/data'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Top from '../src/Top'
import styles from './[id].module.css'
import ReactMarkdown from 'react-markdown'
import Avatar from '../src/Avatar'
import UserAuth from '../src/UserAuth'
import GenerateButton from '../src/GenerateButton'
import PromptList from '@/src/PromptList'

export default function Page({
  prompt,
  children,
}: {
  prompt: Prompt
  children?: Prompt[]
}) {
  const router = useRouter()
  if (router.isFallback) {
    return <p>Loading...</p>
  }
  const { prompt_id, input, body, parent_id, timestamp } = prompt
  return (
    <div>
      {parent_id && (
        <p>
          <Link href={parent_id}>[&#8593; parent]</Link>
        </p>
      )}
      <Top text={input} />
      {body && <ReactMarkdown>{body}</ReactMarkdown>}
      {!body && (
        <p className={styles.notGeneratedYet}>
          This page&apos;s content has not been generated, yet.
        </p>
      )}
      {!body && <GenerateButton id={prompt_id} />}
      {children && <PromptList prompts={children} />}
      {!body && <UserAuth />}
      {timestamp && (
        <p className={styles.generated}>{new Date(timestamp).toUTCString()}</p>
      )}
    </div>
  )
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps = async ({
  params: { id },
}: {
  params: { id: string }
}) => {
  const prompt = await getPrompt(id)
  console.log('prompt', prompt)
  if (!prompt) {
    return {
      notFound: true,
    }
  }
  const children = await getPromptChildren(id)
  return {
    props: {
      id,
      prompt,
      children,
    },
  }
}
