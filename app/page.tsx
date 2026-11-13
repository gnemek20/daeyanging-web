import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Company from '@/components/Company'
import Products from '@/components/Products'
import Custom from '@/components/Custom'
import Craft from '@/components/Craft'
import Numbers from '@/components/Numbers'
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
        <Products />
        <Custom />
        <Craft />
        <Numbers />
        <Contact />
        <Location />
      </main>
      <Footer />
    </>
  )
}
