import type { GeocoderResult } from './types'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

const MOCK_RESULTS: GeocoderResult[] = [
  { id: 'mock-1', label: 'Проспект Тауке хана, Шымкент', latitude: 42.3198, longitude: 69.5889 },
  { id: 'mock-2', label: 'Улица Байтурсынова, Шымкент', latitude: 42.3408, longitude: 69.5907 },
  { id: 'mock-3', label: 'Площадь Аль-Фараби, Шымкент', latitude: 42.3155, longitude: 69.5902 },
]

export async function searchAddresses(query: string, signal: AbortSignal): Promise<GeocoderResult[]> {
  const params = new URLSearchParams({ q: `${query}, Шымкент`, format: 'jsonv2', limit: '5', countrycodes: 'kz', 'accept-language': 'ru' })
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal, headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error('Geocoder unavailable')
    const data = await response.json() as NominatimResult[]
    return data.map((item) => ({ id: String(item.place_id), label: item.display_name, latitude: Number(item.lat), longitude: Number(item.lon) }))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    const normalized = query.toLocaleLowerCase('ru')
    return MOCK_RESULTS.filter((item) => item.label.toLocaleLowerCase('ru').includes(normalized))
  }
}
