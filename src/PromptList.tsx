import { Prompt } from '@/lib/data'
import Link from 'next/link'
import styles from './PromptList.module.css'

export default function PromptList({ prompts }: { prompts: Prompt[] }) {
  return (
    <ol className={styles.children}>
      {prompts.map((prompt) => (
        <li key={prompt.prompt_id}>
          <Link href={prompt.prompt_id}>{prompt.input}</Link>
        </li>
      ))}
    </ol>
  )
}
