import '../styles/globals.css'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'

function MyApp({ Component, pageProps }) {
  return(
    <div class="h-full bg-gray-100">
      <Header />
      <div class="container mx-auto mt-2">
        <Component {...pageProps} />
      </div>
    </div>
  )
}

export default MyApp
