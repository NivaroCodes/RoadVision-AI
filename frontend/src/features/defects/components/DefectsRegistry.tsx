import { useMemo, useState } from 'react'
import { Download, Search, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { DefectMarker } from '@/features/map/types'
import { useDefects } from '../hooks/useDefects'
import { DefectEditDialog } from './DefectEditDialog'
import { DefectsTable } from './DefectsTable'
import { DefectsTableSkeleton } from './DefectsTableSkeleton'
import { exportToCSV } from '../utils/exportToCSV'
import '../defects.css'

export function DefectsRegistry() {
  const { data: defects = [], isLoading, error } = useDefects()
  const [selectedDefect, setSelectedDefect] = useState<DefectMarker | null>(null)
  const [query, setQuery] = useState('')

  const filteredDefects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru')
    if (!normalizedQuery) return defects
    return defects.filter((defect) => String(defect.id).includes(normalizedQuery) || defect.address?.toLocaleLowerCase('ru').includes(normalizedQuery) === true)
  }, [defects, query])

  const handleSave = () => {
    setSelectedDefect(null)
  }

  return (
    <section className="space-y-4" aria-labelledby="defects-registry-title">
      <div className="defects-surface flex flex-col gap-4 rounded-xl border p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="defects-registry-title" className="text-lg font-semibold">Реестр дефектов</h2>
          <p className="mt-1 text-sm text-muted-foreground">Показано {filteredDefects.length} из {defects.length}. Нажмите на строку для редактирования.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <label className="relative min-w-0 flex-1 sm:min-w-64" htmlFor="defects-search">
            <span className="sr-only">Поиск по ID или адресу</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input id="defects-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по ID или адресу" className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
          </label>
          <Button className="defects-primary-button" onClick={() => exportToCSV(filteredDefects)} disabled={filteredDefects.length === 0 || isLoading}><Download data-icon="inline-start" aria-hidden="true" />Скачать CSV</Button>
        </div>
      </div>

      {isLoading ? (
        <DefectsTableSkeleton />
      ) : error ? (
        <div className="defects-surface rounded-xl border border-destructive/50 bg-destructive/10 p-10 text-center">
          <p className="font-medium text-red-500">Ошибка загрузки дефектов</p>
          <p className="mt-1 text-sm text-muted-foreground">Попробуйте обновить страницу.</p>
        </div>
      ) : defects.length === 0 ? (
        <div className="defects-surface rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">Реестр дефектов пуст</p>
          <p className="mt-1 text-sm text-muted-foreground">В базе данных пока нет зафиксированных дефектов.</p>
        </div>
      ) : filteredDefects.length > 0 ? (
        <DefectsTable defects={filteredDefects} onSelect={setSelectedDefect} />
      ) : (
        <EmptyState icon={SearchX} />
      )}

      <DefectEditDialog defect={selectedDefect} onOpenChange={(open) => { if (!open) setSelectedDefect(null) }} onSave={handleSave} />
    </section>
  )
}
