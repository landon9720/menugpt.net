import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Analytics } from '@vercel/analytics/react'
import type { AppProps } from 'next/app'
import { Alice } from 'next/font/google'
import Head from 'next/head'
import Script from 'next/script'
import './_app.css'

const font = Alice({ subsets: ['latin'], weight: '400' })

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={font.className}>
      <Head>
        <title>MenuGpt.net</title>
      </Head>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
      <Analytics />
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4003870517943315"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      ></Script>
    </main>
  )
}
