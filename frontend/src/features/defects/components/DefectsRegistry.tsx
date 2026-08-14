import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DefectMarker } from '@/features/map/types'
import { mockDefects } from '@/features/map/mock/defects'
import { DefectEditDialog } from './DefectEditDialog'
import { DefectsTable } from './DefectsTable'
import { exportToCSV } from '../utils/exportToCSV'
import '../defects.css'

export function DefectsRegistry() {
  const [defects, setDefects] = useState<DefectMarker[]>(mockDefects)
  const [selectedDefect, setSelectedDefect] = useState<DefectMarker | null>(null)
  const [query, setQuery] = useState('')

  const filteredDefects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru')
    if (!normalizedQuery) return defects

    return defects.filter(
      (defect) =>
        String(defect.id).includes(normalizedQuery) ||
        defect.address?.toLocaleLowerCase('ru').includes(normalizedQuery) === true,
    )
  }, [defects, query])

  const handleSave = (updatedDefect: DefectMarker) => {
    setDefects((current) =>
      current.map((defect) => (defect.id === updatedDefect.id ? updatedDefect : defect)),
    )
    setSelectedDefect(null)
  }

  return (
    <section className="space-y-4" aria-labelledby="defects-registry-title">
      <div className="defects-surface flex flex-col gap-4 rounded-xl border p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="defects-registry-title" className="text-lg font-semibold">Реестр дефектов</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Показано {filteredDefects.length} из {defects.length}. Нажмите на строку для редактирования.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-64" htmlFor="defects-search">
            <span className="sr-only">Поиск по ID или адресу</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="defects-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по ID или адресу"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </label>
          <Button className="defects-primary-button" onClick={() => exportToCSV(filteredDefects)} disabled={filteredDefects.length === 0}>
            <Download data-icon="inline-start" />
            Скачать CSV
          </Button>
        </div>
      </div>

      {filteredDefects.length > 0 ? (
        <DefectsTable defects={filteredDefects} onSelect={setSelectedDefect} />
      ) : (
        <div className="defects-surface rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">Дефекты не найдены</p>
          <p className="mt-1 text-sm text-muted-foreground">Измените поисковый запрос.</p>
        </div>
      )}

      <DefectEditDialog
        defect={selectedDefect}
        onOpenChange={(open) => {
          if (!open) setSelectedDefect(null)
        }}
        onSave={handleSave}
      />
    </section>
  )
}
