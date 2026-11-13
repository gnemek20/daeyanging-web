'use client'

import Script from 'next/script'
import { useCallback, useRef, useState } from 'react'

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

const FONT = `'Pretendard Variable',Pretendard,system-ui,sans-serif`

const MARKER_MAIN = `
<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 10px rgba(23,24,28,.35))">
  <div style="
    width:46px;height:46px;border-radius:50%;
    background:#23306B;border:3px solid #E3C47C;
    display:grid;place-items:center;
    font-family:Archivo,${FONT};font-stretch:125%;font-weight:700;font-size:.95rem;
    color:#fff;
  ">DY</div>
  <div style="width:3px;height:14px;background:#B58A3A;margin-top:-1px;border-radius:2px"></div>
</div>`

const markerStation = (line: string, color: string) => `
<div style="
  width:32px;height:32px;border-radius:50%;
  background:${color};
  border:2.5px solid #fff;
  display:grid;place-items:center;
  font-family:${FONT};font-weight:700;font-size:.85rem;
  color:#fff;
  box-shadow:0 2px 8px rgba(23,24,28,.3);
">${line}</div>`

const INFO_WINDOW = `
<div style="
  background:#fff;border-radius:12px;
  padding:1rem 1.2rem;min-width:220px;
  box-shadow:0 10px 30px rgba(23,24,28,.18);
  font-family:${FONT};
">
  <div style="font-size:1rem;color:#17181C;font-weight:700;margin-bottom:.35rem">대양ING</div>
  <div style="font-size:.82rem;color:#5E626B;line-height:1.6">
    서울특별시 종로구<br>김상옥로 59, 한아빌딩 3층
  </div>
  <div style="margin-top:.75rem;display:flex;gap:.45rem">
    <span style="font-size:.72rem;font-weight:600;padding:.25rem .6rem;border-radius:999px;background:#0052A4;color:#fff">1 종로5가 5분</span>
    <span style="font-size:.72rem;font-weight:600;padding:.25rem .6rem;border-radius:999px;background:#00A5DE;color:#fff">4 동대문 10분</span>
  </div>
</div>`

const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID

// 지도 스크립트(수백 KB)는 '오시는 길'이 화면 가까이 왔을 때만 불러온다.
// 관찰은 ref 콜백에서 시작하고, React 19 의 ref 정리 함수로 끝낸다(useEffect 없음).
// 불러온 뒤(그리고 다시 마운트될 때마다) next/script 의 onReady 에서 지도를 그린다.
const NaverMap = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  const watch = useCallback((el: HTMLDivElement | null) => {
    mapRef.current = el
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

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
          background:#fff;border-radius:999px;
          padding:.45rem .85rem;
          font-family:${FONT};font-size:.78rem;color:#17181C;
          box-shadow:0 4px 14px rgba(23,24,28,.18);white-space:nowrap;
        "><strong style="color:${color}">${line}호선</strong> ${name} <span style="color:#5E626B">${walk}</span></div>`,
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

  return (
    <>
      <div ref={watch} className="naver-map" />
      {CLIENT_ID && near && (
        <Script
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${CLIENT_ID}`}
          onReady={initMap}
        />
      )}
    </>
  )
}

export default NaverMap
