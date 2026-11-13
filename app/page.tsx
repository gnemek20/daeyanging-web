import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Company from '@/components/Company'
import Custom from '@/components/Custom'
import Craft from '@/components/Craft'
import Numbers from '@/components/Numbers'
import Products from '@/components/Products'
import Contact from '@/components/Contact'
import Location from '@/components/Location'
import Footer from '@/components/Footer'

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Company />
        <Custom />
        <Craft />
        <Numbers />
        <Products />
        <Contact />
        <Location />
      </main>
      <Footer />
    </>
  )
}
