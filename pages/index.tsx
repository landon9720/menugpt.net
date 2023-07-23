import { colors, listPrompts } from '@/lib/data'
import Link from 'next/link'

export default function Index({
  ids,
  prompts,
}: {
  ids: string[]
  prompts: { id: string; prompt: string }[]
}) {
  return (
    <>
      <h1>Colors</h1>
      <ol>
        {ids.map((id) => (
          <li key={id}>
            <Link href={`color/${id}`}>{id}</Link>
          </li>
        ))}
      </ol>
      <h1>Prompts</h1>
      <ol>
        {prompts.map(({ id, prompt }) => (
          <li key={id}>
            <Link href={`prompt/${id}`}>{prompt}</Link>
          </li>
        ))}
      </ol>
    </>
  )
}

export function getStaticProps() {
  const ids = colors()
  const prompts = listPrompts().map(([id, { prompt }]) => ({
    id,
    prompt,
  }))
  return {
    props: { ids, prompts },
  }
}
