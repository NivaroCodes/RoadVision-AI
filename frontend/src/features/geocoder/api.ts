import type { GeocoderResult } from './types'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export async function searchAddresses(query: string, signal: AbortSignal): Promise<GeocoderResult[]> {
  const params = new URLSearchParams({
    q: `${query}, Шымкент`,
    format: 'jsonv2',
    limit: '5',
    countrycodes: 'kz',
    'accept-language': 'ru',
    email: 'contact@roadvision.ai'
  })
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Geocoder unavailable')
  const data = await response.json() as NominatimResult[]
  return data.map((item) => ({ id: String(item.place_id), label: item.display_name, latitude: Number(item.lat), longitude: Number(item.lon) }))
}
