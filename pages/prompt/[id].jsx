import { useRouter } from 'next/router'
import { LoremIpsum } from 'lorem-ipsum'
import { getPrompt, setPrompt } from '@/lib/data'
import Link from 'next/link'
import md5 from 'md5'

export default function Page({ id, prompt, body, children }) {
  const router = useRouter()
  if (router.isFallback) {
    return <div>Loading...</div>
  }
  return (
    <div>
      <h1>{prompt}</h1>
      <p>{body}</p>
      <p>Do you want to know more?</p>
      <ol>
        {children.map((child) => (
          <li key={child.id}>
            <Link href={child.id}>{child.prompt}</Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

export const getStaticPaths = async () => {
  return {
    paths: [{ params: { id: '1' } }],
    fallback: true,
  }
}

const gen = new LoremIpsum()

export const getStaticProps = async ({ params: { id } }) => {
  var record = await getPrompt(id)
  if (!record) {
    return {
      notFound: true,
    }
  }
  if (!record.body) {
    record.body = gen.generateWords(7)
    record.children = []
    for (var i = 0; i < 10; ++i) {
      const prompt = gen.generateWords(3)
      const id = md5(prompt)
      const child = {
        id,
        prompt,
      }
      record.children[i] = child
      await setPrompt(id, child)
    }
  }
  return {
    props: {
      id,
      prompt: record.prompt,
      body: record.body,
      children: record.children,
    },
  }
}
