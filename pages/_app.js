import '../styles/globals.css'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'

function MyApp({ Component, pageProps }) {
  return(
    <>
      <Header />
      <div class="container mx-auto mt-2">
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp
