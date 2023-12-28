import { Prompt, getPrompt, getPromptChildren } from '@/lib/data'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Top from '../src/Top'
import styles from './[id].module.css'
import ReactMarkdown from 'react-markdown'
import Timestamp from '../src/Timestamp'
import GenerateButton from '../src/GenerateButton'
import PromptList from '@/src/PromptList'
import Head from 'next/head'

export default function Page({
  prompt,
  children,
}: {
  prompt: Prompt
  children: Prompt[]
}) {
  const router = useRouter()
  if (router.isFallback) {
    return <p>Loading...</p>
  }
  const { prompt_id, input, body, parent_id, timestamp } = prompt
  return (
    <div>
      <Head>
        <title>{input}</title>
      </Head>
      <p>
        <Link
          href={parent_id || '/'}
          title="Go to page where this page was generated"
        >
          [&#8593; parent]
        </Link>
      </p>
      <Top text={input} />
      {body && <ReactMarkdown>{body}</ReactMarkdown>}
      {!body && <GenerateButton id={prompt_id} generateContentType="body" />}
      {children.length > 0 && <PromptList prompts={children} />}
      {body && !children.length && (
        <GenerateButton id={prompt_id} generateContentType="children" />
      )}
      {body && (
        <Timestamp timestamp={timestamp} title="When this page was generated" />
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
