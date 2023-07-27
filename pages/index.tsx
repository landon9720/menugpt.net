import Link from 'next/link'
import { useRouter } from 'next/router'
import Top from '../src/Top'
import { Prompt, getRecentPrompts, getTopPrompts } from '@/lib/data'
import { GetStaticProps } from 'next'
import PromptList from '@/src/PromptList'

interface Props {
  top: Prompt[]
  recent: Prompt[]
}

export default function Index({ top, recent }: Props) {
  const router = useRouter()
  const homeRedirectTo = router.query.homeRedirectTo as string
  if (homeRedirectTo) {
    router.replace(homeRedirectTo)
  }
  return (
    <>
      <Top text={'Welcome to MenuGpt.net'} />
      <h3>Top</h3>
      <PromptList prompts={top} />
      <h3>Recent</h3>
      <PromptList prompts={recent} />
      <p>
        <Link href="faq">Frequently asked questions (FAQ)</Link>
      </p>
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
    },
    revalidate: 60,
  }
}
