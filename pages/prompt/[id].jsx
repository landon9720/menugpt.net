import { getPrompt } from '@/lib/data'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Top from '../Top'
import styles from './prompt.module.css'
import ReactMarkdown from 'react-markdown'
import { Avatar } from './Avatar'
import { UserAuth } from './UserAuth'
import { GenerateButton } from './GenerateButton'

export default function Page({ id, prompt }) {
  const router = useRouter()
  if (router.isFallback) {
    return <p>Loading...</p>
  }
  const { prompt: promptText, body, user, parent, children, timestamp } = prompt
  return (
    <div>
      {parent && (
        <p>
          <Link href={parent}>[&#8593; parent]</Link>
        </p>
      )}
      <Top text={promptText} />
      {body && <ReactMarkdown>{body}</ReactMarkdown>}
      {!body && (
        <p className={styles.notGeneratedYet}>
          This page&apos;s content has not been generated, yet.
        </p>
      )}
      {!body && <GenerateButton id={id} />}
      {user && (
        <p>
          by <Avatar user={user} />
          {timestamp && <> at {new Date(timestamp).toUTCString()}</>}
        </p>
      )}
      {children && (
        <ol>
          {prompt.children.map((child) => (
            <li key={child.id}>
              <Link href={child.id}>{child.prompt}</Link>
            </li>
          ))}
        </ol>
      )}
      <UserAuth />
    </div>
  )
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps = async ({ params: { id } }) => {
  var prompt = await getPrompt(id)
  if (!prompt) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      id,
      prompt,
    },
  }
}
