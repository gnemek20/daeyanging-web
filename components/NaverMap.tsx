'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    naver: any
  }
}

const MAIN = { lat: 37.5706, lng: 127.0057 }
const STATIONS = [
  { lat: 37.5699, lng: 127.0092, line: '1', color: '#0052A4', name: '종로5가역', walk: '도보 5분' },
  { lat: 37.5712, lng: 127.0097, line: '4', color: '#00A5DE', name: '동대문역', walk: '도보 10분' },
]

const MARKER_MAIN = `
<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,.45))">
  <div style="
    width:48px;height:48px;border-radius:50%;
    background:linear-gradient(135deg,#f6e6b4,#c8a458 55%,#8a6a31);
    border:2.5px solid #f6e6b4;
    display:grid;place-items:center;
    font-family:Cormorant Garamond,serif;font-weight:600;font-size:1.1rem;
    color:#1a1410;
    box-shadow:0 0 0 4px rgba(201,164,82,.22),0 6px 18px rgba(0,0,0,.4);
  ">DY</div>
  <div style="width:2px;height:14px;background:linear-gradient(#c8a458,transparent);margin-top:-1px"></div>
</div>`

const markerStation = (line: string, color: string) => `
<div style="
  width:34px;height:34px;border-radius:50%;
  background:${color};
  border:2.5px solid rgba(255,255,255,.9);
  display:grid;place-items:center;
  font-family:Jost,sans-serif;font-weight:600;font-size:.88rem;
  color:#fff;
  box-shadow:0 3px 10px rgba(0,0,0,.4);
  filter:drop-shadow(0 2px 6px rgba(0,0,0,.35));
">${line}</div>`

const INFO_WINDOW = `
<div style="
  background:#1a1610;border:1px solid rgba(201,164,82,.35);border-radius:6px;
  padding:1.2rem 1.5rem;min-width:220px;
  box-shadow:0 12px 40px rgba(0,0,0,.6);
">
  <div style="font-family:Cormorant Garamond,serif;font-size:1.15rem;color:#f6e6b4;font-weight:500;margin-bottom:.5rem">대양ING</div>
  <div style="font-family:Noto Serif KR,serif;font-size:.82rem;color:#9a9082;line-height:1.7">
    서울특별시 종로구<br>김상옥로 59, 한아빌딩 3층
  </div>
  <div style="margin-top:.85rem;padding-top:.85rem;border-top:1px solid rgba(201,164,82,.15);display:flex;gap:.55rem">
    <span style="font-family:Jost,sans-serif;font-size:.65rem;letter-spacing:.08em;padding:.28rem .65rem;border-radius:3px;background:#0052A4;color:#fff">1 종로5가 5분</span>
    <span style="font-family:Jost,sans-serif;font-size:.65rem;letter-spacing:.08em;padding:.28rem .65rem;border-radius:3px;background:#00A5DE;color:#fff">4 동대문 10분</span>
  </div>
</div>`

const NaverMap = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<unknown>(null)

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
    if (!clientId || !mapRef.current) return

    const initMap = () => {
      if (!mapRef.current || !window.naver?.maps) return
      const { maps } = window.naver

      const center = new maps.LatLng(MAIN.lat, MAIN.lng)

      const map = new maps.Map(mapRef.current, {
        center,
        zoom: 16,
        mapTypeControl: false,
        scaleControl: false,
        logoControl: true,
        logoControlOptions: { position: maps.Position.BOTTOM_LEFT },
        mapDataControl: false,
        zoomControl: true,
        zoomControlOptions: {
          style: maps.ZoomControlStyle.SMALL,
          position: maps.Position.TOP_RIGHT,
        },
        minZoom: 10,
      })
      mapInstance.current = map

      const mainMarker = new maps.Marker({
        position: center,
        map,
        icon: {
          content: MARKER_MAIN,
          anchor: new maps.Point(24, 66),
        },
        zIndex: 10,
      })

      const infoWindow = new maps.InfoWindow({
        content: INFO_WINDOW,
        borderWidth: 0,
        backgroundColor: 'transparent',
        disableAnchor: true,
        pixelOffset: new maps.Point(0, -74),
      })

      maps.Event.addListener(mainMarker, 'click', () => {
        if (infoWindow.getMap()) infoWindow.close()
        else infoWindow.open(map, mainMarker)
      })

      infoWindow.open(map, mainMarker)

      STATIONS.forEach(({ lat, lng, line, color, name, walk }) => {
        const pos = new maps.LatLng(lat, lng)
        const marker = new maps.Marker({
          position: pos,
          map,
          icon: {
            content: markerStation(line, color),
            anchor: new maps.Point(17, 17),
          },
          zIndex: 5,
        })

        const stationInfo = new maps.InfoWindow({
          content: `<div style="
            background:#1a1610;border:1px solid ${color}55;border-radius:4px;
            padding:.55rem .9rem;
            font-family:Noto Serif KR,serif;font-size:.78rem;color:#ece6da;
            box-shadow:0 4px 14px rgba(0,0,0,.5);white-space:nowrap;
          "><strong style="color:${color}">${line}호선</strong> ${name} · <span style="color:#9a9082">${walk}</span></div>`,
          borderWidth: 0,
          backgroundColor: 'transparent',
          disableAnchor: true,
          pixelOffset: new maps.Point(0, -44),
        })

        maps.Event.addListener(marker, 'click', () => {
          if (stationInfo.getMap()) stationInfo.close()
          else stationInfo.open(map, marker)
        })
      })
    }

    const SCRIPT_ID = 'naver-maps-v3'
    if (document.getElementById(SCRIPT_ID)) {
      if (window.naver?.maps) initMap()
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`
    script.async = true
    script.onload = initMap
    document.head.appendChild(script)
  }, [])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', minHeight: '420px', borderRadius: '4px' }}
    />
  )
}

export default NaverMap
