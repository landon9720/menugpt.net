import {
  BODY_SYSTEM_PROMPT,
  NEW_USER_CREDITS,
  SUGGESTION_SYSTEM_PROMPT,
} from '@/lib/globals'
import Link from 'next/link'
import Top from './Top'
import styles from './faq.module.css'

export default function Index() {
  return (
    <>
      <Top text="MenuGPT.net FAQ" />
      <p className={styles.question}>What is it?</p>
      <p>It a public webpage that provides a conversation with an AI.</p>
      <p className={styles.question}>How does it work?</p>
      <p>
        Each page of the conversation is generated on-demand by users.{' '}
        <Link href="https://platform.openai.com/docs/api-reference/completions">
          OpenAI Chat Completion API
        </Link>{' '}
        is used to generate page content.
      </p>
      <p className={styles.question}>What internal pre-prompting is used?</p>
      <p>To generate the page body the following system prompt is used:</p>
      <blockquote>{BODY_SYSTEM_PROMPT}</blockquote>
      <p>To generate menu of responses, the following system prompt is used:</p>
      <blockquote>{SUGGESTION_SYSTEM_PROMPT}</blockquote>
      <p className={styles.question}>Is sign-in required?</p>
      <p>
        Pages are freely visible to anybody on the net. However, sign-in is
        required to generate additional pages.
      </p>
      <p className={styles.question}>What are credits?</p>
      <p>
        The cost to generate a page is 1 credit. New accounts are granted{' '}
        {NEW_USER_CREDITS} credits. To request additional credits, contact the
        author.
      </p>
      <p className={styles.question}>How to contact the author?</p>
      <p>
        You can find the author&apos;s email address at the{' '}
        <Link href="https://github.com/landon9720">GitHub profile page</Link>{' '}
        (requires sign-in).
      </p>
      <p className={styles.question}>Where is the source?</p>
      <p>
        The project is an open source hobby project{' '}
        <Link href="https://github.com/landon9720/menugpt.net">
          hosted on GitHub.
        </Link>
      </p>
      <p className={styles.question}>Where to report bugs or issues?</p>
      <p>
        Report bugs or other issues{' '}
        <Link href="https://github.com/landon9720/menugpt.net/issues">
          here
        </Link>
        .
      </p>
    </>
  )
}
