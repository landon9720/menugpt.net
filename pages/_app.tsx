import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4003870517943315"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      ></Script>
    </>
  )
}

export default MyApp
