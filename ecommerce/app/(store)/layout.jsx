import Footer from '@/components/common/Footer'
import Navbar from '@/components/common/Navbar'
import TopAdvert from '@/components/advert/TopAdvert'
import React from 'react'

export default function StoreLayout({children}) {
  return (
    <>
    <TopAdvert/>
    <Navbar/>
      {children}
      <Footer/>
    </>
  )
}
