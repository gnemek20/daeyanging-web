'use client'

import dynamic from 'next/dynamic'

const NaverMap = dynamic(() => import('./NaverMap'), {
  ssr: false,
  loading: () => <div className="map-loading">지도를 불러오는 중…</div>,
})

const LocationMap = () => <NaverMap />

export default LocationMap
