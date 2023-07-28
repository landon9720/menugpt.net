import { Prompt } from '@/lib/data'
import Link from 'next/link'

export default function PromptList({ prompts }: { prompts: Prompt[] }) {
  return (
    <ol>
      {prompts.map((prompt) => (
        <li key={prompt.prompt_id}>
          <Link href={prompt.prompt_id}>{prompt.input}</Link>
        </li>
      ))}
    </ol>
  )
}
