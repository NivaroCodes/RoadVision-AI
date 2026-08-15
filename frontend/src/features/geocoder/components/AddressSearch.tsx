import { useEffect, useState } from 'react'
import { Loader2, MapPin, Search, X } from 'lucide-react'
import { useMap } from 'react-leaflet'
import { searchAddresses } from '../api'
import { useDebounce } from '../hooks/useDebounce'
import type { GeocoderResult } from '../types'

export function AddressSearch() {
  const map = useMap()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocoderResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebounce(query.trim(), 1000)

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setResults([])
      setIsLoading(false)
      return
    }
    const controller = new AbortController()
    setIsLoading(true)
    searchAddresses(debouncedQuery, controller.signal)
      .then((items) => { setResults(items); setIsOpen(true) })
      .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === 'AbortError')) setResults([]) })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false) })
    return () => controller.abort()
  }, [debouncedQuery])

  const selectResult = (result: GeocoderResult) => {
    setQuery(result.label)
    setIsOpen(false)
    map.flyTo([result.latitude, result.longitude], 16, { animate: true, duration: 1.5 })
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="absolute bottom-20 right-3 z-[600] w-[min(360px,calc(100%-1.5rem))] sm:right-4">
      {isOpen && debouncedQuery.length >= 3 && !isLoading ? (
        <div className="absolute bottom-full mb-2 w-full overflow-hidden rounded-xl border bg-card/95 shadow-xl backdrop-blur" role="listbox" aria-label="Найденные адреса">
          {results.length > 0 ? results.map((result) => <button type="button" key={result.id} onClick={() => selectResult(result)} className="flex w-full gap-3 border-b px-3 py-3 text-left text-sm transition last:border-b-0 hover:bg-accent focus-visible:bg-accent focus-visible:outline-none" role="option"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><span className="line-clamp-2">{result.label}</span></button>) : <p className="px-4 py-5 text-center text-sm text-muted-foreground" role="status">Адреса не найдены</p>}
        </div>
      ) : null}
      <label className="relative block" htmlFor="address-geocoder-search">
        <span className="sr-only">Найти адрес на карте</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input id="address-geocoder-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setIsOpen(true) }} onFocus={() => setIsOpen(true)} placeholder="Найти адрес на карте" autoComplete="off" className="h-11 w-full rounded-xl border bg-card/95 pl-9 pr-10 text-sm text-foreground shadow-xl outline-none backdrop-blur transition focus-visible:ring-2 focus-visible:ring-ring" />
        {isLoading ? <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" /> : query ? <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Очистить поиск адреса"><X className="size-4" aria-hidden="true" /></button> : null}
      </label>
    </div>
  )
}
