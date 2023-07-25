import { colors } from '@/lib/data'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Index({ ids }: { ids: string[] }) {
  const router = useRouter()
  const homeRedirectTo = router.query.homeRedirectTo as string
  if (homeRedirectTo) {
    router.replace(homeRedirectTo)
  }
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
    </>
  )
}

export async function getStaticProps() {
  const ids = colors()
  return {
    props: { ids },
  }
}
