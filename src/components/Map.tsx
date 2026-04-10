import React, { useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, ZoomControl, useMap, Pane } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import { Customer, KMZLayer } from '../types/par'
import { PopupCard } from './PopupCard'
import {
  getMarkerColor,
  getMarkerRadius,
} from '../utils/parHelpers'
import type { CircleMarker as LeafletCircleMarker } from 'leaflet'

// This component must only ever be imported via dynamic() with ssr:false
// because Leaflet accesses window at module load time.

interface MapProps {
  customers: Customer[]
  kmzLayers: KMZLayer[]
  onKMZDrop: (file: File) => void
  mapStyle: string
  focusedCustomer?: Customer | null
  onZoomChange?: (zoom: number) => void
  showBoundaries?: boolean
}

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

function FlyToController({ customer }: { customer: Customer | null | undefined }) {
  const map = useMap()
  const markerRef = useRef<LeafletCircleMarker | null>(null)

  useEffect(() => {
    if (!customer) return
    map.flyTo([customer.latitude, customer.longitude], 17, { duration: 0.8 })
    const timer = setTimeout(() => {
      markerRef.current?.openPopup()
    }, 850)
    return () => clearTimeout(timer)
  }, [customer, map])

  if (!customer) return null

  const color = getMarkerColor(customer)
  return (
    <CircleMarker
      ref={markerRef}
      center={[customer.latitude, customer.longitude]}
      radius={getMarkerRadius(customer) + 5}
      pathOptions={{ color: '#2563eb', fillColor: color, fillOpacity: 1, weight: 3 }}
    >
      <Popup className="par-popup">
        <PopupCard customer={customer} />
      </Popup>
    </CircleMarker>
  )
}

const LUSAKA_CENTER: [number, number] = [-15.4166, 28.2833]
const DEFAULT_ZOOM = 13

export default function Map({ customers, kmzLayers, onKMZDrop, mapStyle, focusedCustomer, onZoomChange, showBoundaries = true }: MapProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) onKMZDrop(file)
    },
    [onKMZDrop]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const customerMarkers = React.useMemo(() => {
    return customers.map((customer) => {
      const color = getMarkerColor(customer)
      const radius = getMarkerRadius(customer)
      return (
        <CircleMarker
          key={customer.contract_ref}
          center={[customer.latitude, customer.longitude]}
          radius={radius + 2}
          pathOptions={{
            color: '#000000',
            fillColor: color,
            fillOpacity: 1,
            weight: 1,
          }}
          bubblingMouseEvents={false}
        >
          <Popup className="par-popup">
            <PopupCard customer={customer} />
          </Popup>
        </CircleMarker>
      )
    })
  }, [customers])

  return (
    <div
      style={{ height: '100%', width: '100%' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
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

        {/* KMZ polygon layers — only rendered when visible */}
        {showBoundaries && kmzLayers
          .filter((layer) => layer.visible)
          .map((layer) => {
            const isBuffer = layer.name.startsWith('Buffers —')
            return (
              <GeoJSON
                key={layer.id}
                data={layer.geojson as unknown as any}
                interactive={true}
                style={() => ({
                  color: layer.color,
                  weight: 2,
                  fillColor: layer.color,
                  fillOpacity: 0.08,
                })}
                onEachFeature={(feature, leafletLayer) => {
                  // Buffers: use per-feature name from CSV (feature.properties.name)
                  // Boundaries: use the admin-renamed layer name
                  const name = isBuffer
                    ? (feature.properties?.name || layer.name)
                    : layer.name
                  if (name) {
                    leafletLayer.bindTooltip(name, {
                      sticky: true,
                      direction: 'top',
                      offset: [0, -6],
                      className: 'par-tooltip',
                    })
                  }
                }}
              />
            )
          })}

        {/* Customer markers in a higher-z pane so polygon fills don't intercept clicks */}
        <Pane name="customerPane" style={{ zIndex: 450 }}>
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            disableClusteringAtZoom={16}
          >
            {customerMarkers}
          </MarkerClusterGroup>
        </Pane>

        <ZoomTracker onZoomChange={onZoomChange} />
        <FlyToController customer={focusedCustomer} />
      </MapContainer>
    </div>
  )
}
