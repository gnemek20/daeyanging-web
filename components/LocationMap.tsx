'use client'

import dynamic from 'next/dynamic'

const NaverMap = dynamic(() => import('./NaverMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%', minHeight: '420px',
      background: '#1a1610',
      display: 'grid', placeItems: 'center',
      borderRadius: '4px',
    }}>
      <span style={{ fontFamily: 'Jost,sans-serif', fontSize: '.68rem', letterSpacing: '.22em', textTransform: 'uppercase', color: '#6d6557' }}>Loading Map…</span>
    </div>
  ),
})

const LocationMap = () => <NaverMap />

export default LocationMap
