import { supabase } from './supabase'
import { parseKmz, parseKml } from '../utils/kmzParser'
import type { KMZLayer } from '../types/par'

export interface StoredLayer {
  id: string
  name: string
  color: string
  visible: boolean
  locked: boolean
  file_path: string
  created_at: string
}

export async function fetchLayers(): Promise<KMZLayer[]> {
  const { data, error } = await supabase
    .from('kmz_layers')
    .select('*')
    .order('created_at', { ascending: true })

  if (error || !data) { console.error('Error fetching layers:', error); return [] }

  const layers: KMZLayer[] = []
  for (const row of data as StoredLayer[]) {
    try {
      const { data: fileData, error: downloadError } = await supabase.storage.from('kmz-files').download(row.file_path)
      if (downloadError || !fileData) { console.error(`Error downloading file for ${row.name}:`, downloadError); continue }

      let geojson: any
      const fp = row.file_path.toLowerCase()
      if (fp.endsWith('.geojson') || fp.endsWith('.json')) {
        geojson = JSON.parse(await fileData.text())
      } else if (fp.endsWith('.kml')) {
        geojson = await parseKml(new File([fileData], row.file_path, { type: 'application/vnd.google-earth.kml+xml' }))
      } else {
        geojson = await parseKmz(new File([fileData], row.file_path, { type: 'application/vnd.google-earth.kmz' }))
      }

      layers.push({ id: row.id, name: row.name, color: row.color, visible: row.visible, locked: row.locked, file_path: row.file_path, geojson, isBuffer: false })
    } catch (err) { console.error(`Failed to parse file for ${row.name}:`, err) }
  }
  return layers
}

export async function uploadLayer(file: File, name: string, color: string, locked: boolean): Promise<void> {
  const filePath = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
  const { error: uploadError } = await supabase.storage.from('kmz-files').upload(filePath, file)
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
  const { error: insertError } = await supabase.from('kmz_layers').insert({ name, color, visible: true, locked, file_path: filePath })
  if (insertError) { await supabase.storage.from('kmz-files').remove([filePath]); throw new Error(`Database insert failed: ${insertError.message}`) }
}

export async function deleteLayer(id: string, filePath: string): Promise<void> {
  await supabase.storage.from('kmz-files').remove([filePath])
  const { error } = await supabase.from('kmz_layers').delete().eq('id', id)
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

export async function toggleLayerVisibility(id: string, visible: boolean): Promise<void> {
  const { error } = await supabase.from('kmz_layers').update({ visible }).eq('id', id)
  if (error) throw new Error(`Toggle failed: ${error.message}`)
}

export async function updateLayerColor(id: string, color: string): Promise<void> {
  const { error } = await supabase.from('kmz_layers').update({ color }).eq('id', id)
  if (error) throw new Error(`Update color failed: ${error.message}`)
}

export async function renameLayer(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('kmz_layers').update({ name }).eq('id', id)
  if (error) throw new Error(`Rename failed: ${error.message}`)
}

// ─── Buffer Layer Functions ───────────────────────────────────────────────────

export async function fetchBufferLayers(): Promise<KMZLayer[]> {
  const { data, error } = await supabase
    .from('buffer_layers')
    .select('*')
    .order('created_at', { ascending: true })

  if (error || !data) { console.error('Error fetching buffer layers:', error); return [] }

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    visible: row.visible,
    locked: row.locked,
    file_path: row.file_path,
    geojson: row.geojson,
    isBuffer: true,   // ← Map.tsx uses this to show per-feature labels instead of layer name
  }))
}

export async function uploadBufferLayer(file: File, name: string, color: string, locked: boolean): Promise<void> {
  const filePath = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
  const { error: uploadError } = await supabase.storage.from('kmz-files').upload(filePath, file)
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
  const geojson = JSON.parse(await file.text())
  const { error: insertError } = await supabase.from('buffer_layers').insert({ name, color, visible: true, locked, file_path: filePath, geojson })
  if (insertError) { await supabase.storage.from('kmz-files').remove([filePath]); throw new Error(`Database insert failed: ${insertError.message}`) }
}

export async function deleteBufferLayer(id: string, filePath: string): Promise<void> {
  if (filePath) await supabase.storage.from('kmz-files').remove([filePath])
  const { error } = await supabase.from('buffer_layers').delete().eq('id', id)
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

export async function toggleBufferLayerVisibility(id: string, visible: boolean): Promise<void> {
  const { error } = await supabase.from('buffer_layers').update({ visible }).eq('id', id)
  if (error) throw new Error(`Toggle failed: ${error.message}`)
}

export async function updateBufferLayerColor(id: string, color: string): Promise<void> {
  const { error } = await supabase.from('buffer_layers').update({ color }).eq('id', id)
  if (error) throw new Error(`Update buffer color failed: ${error.message}`)
}

export async function renameBufferLayer(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('buffer_layers').update({ name }).eq('id', id)
  if (error) throw new Error(`Rename buffer failed: ${error.message}`)
}