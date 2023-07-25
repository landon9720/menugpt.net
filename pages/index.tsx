import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Index() {
  const router = useRouter()
  const homeRedirectTo = router.query.homeRedirectTo as string
  if (homeRedirectTo) {
    router.replace(homeRedirectTo)
  }
  return <Link href="prompt/1">Start here</Link>
}
