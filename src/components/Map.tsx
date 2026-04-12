import 'leaflet/dist/leaflet.css'
import React, { useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, ZoomControl, useMap, Pane, Marker } from 'react-leaflet'
import type { GeoJsonObject } from 'geojson'

import { Customer, KMZLayer } from '../types/par'
import type { GeoJSONFeature } from '../utils/kmzParser'
import { PopupCard } from './PopupCard'
import { getMarkerColor, getMarkerRadius } from '../utils/parHelpers'
import L from 'leaflet'
import type { CircleMarker as LeafletCircleMarker } from 'leaflet'

const renderer = L.canvas({ padding: 0.5 })

interface MapProps {
  customers: Customer[]
  kmzLayers: KMZLayer[]
  onKMZDrop: (file: File) => void
  mapStyle: string
  focusedCustomer?: Customer | null
  onZoomChange?: (zoom: number) => void
  showBoundaries?: boolean
  showBufferPins?: boolean
}

function polygonCentroid(coords: [number, number][]): [number, number] {
  const n = coords.length
  const sumLng = coords.reduce((s, c) => s + c[0], 0)
  const sumLat = coords.reduce((s, c) => s + c[1], 0)
  return [sumLat / n, sumLng / n]
}

const pinIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 24 28" fill="#111111">
    <path d="M12 0C7.6 0 4 3.6 4 8c0 5.4 8 16 8 16s8-10.6 8-16c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
  </svg>`,
  className: '',
  iconSize: [18, 22],
  iconAnchor: [9, 22],
})

function ZoomTracker({ onZoomChange }: { onZoomChange?: (zoom: number) => void }) {
  const map = useMap()
  useEffect(() => {
    if (!onZoomChange) return
    onZoomChange(map.getZoom())
    const handler = () => onZoomChange(map.getZoom())
    map.on('zoomend', handler)
    return () => { map.off('zoomend', handler) }
  }, [map, onZoomChange])
  return null
}

function CursorController() {
  const map = useMap()
  useEffect(() => {
    const onOpen  = () => { map.getContainer().style.cursor = 'default' }
    const onClose = () => { map.getContainer().style.cursor = '' }
    map.on('popupopen', onOpen)
    map.on('popupclose', onClose)
    return () => { map.off('popupopen', onOpen); map.off('popupclose', onClose) }
  }, [map])
  return null
}

function FlyToController({ customer }: { customer: Customer | null | undefined }) {
  const map = useMap()
  const markerRef = useRef<LeafletCircleMarker | null>(null)

  useEffect(() => {
    if (!customer) return
    map.flyTo([customer.latitude, customer.longitude], 17, { duration: 0.8 })
    const timer = setTimeout(() => { markerRef.current?.openPopup() }, 850)
    return () => clearTimeout(timer)
  }, [customer, map])

  if (!customer) return null

  const color = getMarkerColor(customer)
  return (
    <CircleMarker
      ref={markerRef}
      center={[customer.latitude, customer.longitude]}
      radius={getMarkerRadius(customer) + 5}
      pathOptions={{ color: '#111111', fillColor: color, fillOpacity: 1, weight: 2 }}
      renderer={renderer}
    >
      <Popup className="par-popup"><PopupCard customer={customer} /></Popup>
    </CircleMarker>
  )
}

const LUSAKA_CENTER: [number, number] = [-15.4166, 28.2833]
const DEFAULT_ZOOM = 13

export default function Map({
  customers, kmzLayers, onKMZDrop, mapStyle,
  focusedCustomer, onZoomChange,
  showBoundaries = true, showBufferPins = true,
}: MapProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onKMZDrop(file)
  }, [onKMZDrop])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const customerMarkers = React.useMemo(() => {
    return customers.map((customer, i) => {
      const color = getMarkerColor(customer)
      const radius = getMarkerRadius(customer)
      return (
        <CircleMarker
          key={customer.contract_ref || i}
          center={[customer.latitude, customer.longitude]}
          radius={radius + 2}
          pathOptions={{ color: '#000000', fillColor: color, fillOpacity: 1, weight: 1 }}
          bubblingMouseEvents={false}
          renderer={renderer}
        >
          <Popup className="par-popup"><PopupCard customer={customer} /></Popup>
        </CircleMarker>
      )
    })
  }, [customers])

  return (
    <div style={{ height: '100%', width: '100%' }} onDrop={handleDrop} onDragOver={handleDragOver}>
      <MapContainer
        center={LUSAKA_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/${mapStyle}/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
          tileSize={512}
          zoomOffset={-1}
          attribution="© Mapbox © OpenStreetMap"
        />

        {/*
          GeoJSON layers live in overlayPane (z-index 400).
          Customer markers live in customerPane (z-index 450).
          Because 450 > 400, the canvas element for customers is always on top,
          so customer clicks are never blocked by polygon layers —
          while tooltips on polygons still work when hovering empty space.
        */}
        {showBoundaries && kmzLayers
          .filter(layer => layer.visible)
          .map(layer => (
            <GeoJSON
              key={layer.id}
              data={layer.geojson as unknown as GeoJsonObject}
              interactive={true}
              style={() => ({
                color: layer.color,
                weight: 2,
                fillColor: layer.color,
                fillOpacity: 0.08,
              })}
              onEachFeature={(feature, leafletLayer) => {
                // Boundaries: show admin-renamed layer name
                // Buffers: show per-feature name from CSV properties
                const label = layer.isBuffer
                  ? (feature.properties?.name ?? '')
                  : layer.name
                if (label) {
                  leafletLayer.bindTooltip(label, {
                    sticky: true,
                    direction: 'top',
                    offset: [0, -6],
                    className: 'par-tooltip',
                  })
                }
              }}
            />
          ))}

        {/* Buffer center pins */}
        {showBufferPins && kmzLayers
          .filter(layer => layer.visible && layer.isBuffer && layer.geojson)
          .flatMap(layer =>
            (layer.geojson.features ?? []).map((feature: GeoJSONFeature, i: number) => {
              const coords = feature.geometry?.coordinates?.[0] as [number, number][]
              if (!coords?.length) return null
              const center = polygonCentroid(coords)
              const name = (feature.properties?.name as string | undefined) ?? ''
              return (
                <Marker key={`pin-${layer.id}-${i}`} position={center} icon={pinIcon}>
                  {name && (
                    <Popup className="par-popup">
                      <div style={{ padding: '12px 16px', fontFamily: 'Inter,system-ui,sans-serif', fontSize: 13, fontWeight: 600 }}>{name}</div>
                    </Popup>
                  )}
                </Marker>
              )
            }).filter(Boolean)
          )}

        {/*
          customerPane at z-index 450 sits above overlayPane (400).
          The canvas element capturing customer clicks is therefore always
          rendered on top of GeoJSON SVG — customers are always clickable.
        */}
        <Pane name="customerPane" style={{ zIndex: 450 }}>
          {customerMarkers}
        </Pane>

        <ZoomTracker onZoomChange={onZoomChange} />
        <CursorController />
        <FlyToController customer={focusedCustomer} />
      </MapContainer>
    </div>
  )
}