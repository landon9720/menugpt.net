import Image from 'next/image'
import Link from 'next/link'
import styles from './Top.module.css'

export default function Top({ text }: { text: string }) {
  return (
    <header className={styles.head}>
      <Link href="/" title="Go to MenuGpt.net home page">
        <Image
          className={styles.gopher}
          src="/gopher.png"
          width={940}
          height={940}
          alt="Gopher logo"
        />
      </Link>
      <h1>{text}</h1>
    </header>
  )
}
