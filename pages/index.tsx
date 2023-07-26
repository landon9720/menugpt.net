import Link from 'next/link'
import { useRouter } from 'next/router'
import Top from '../src/Top'

export default function Index() {
  const router = useRouter()
  const homeRedirectTo = router.query.homeRedirectTo as string
  if (homeRedirectTo) {
    router.replace(homeRedirectTo)
  }
  return (
    <>
      <Top text={'Welcome to MenuGpt.net'} />
      <p>
        <Link href="1">Start here</Link>
      </p>
      <p>
        <Link href="faq">Frequently asked questions (FAQ)</Link>
      </p>
    </>
  )
}
