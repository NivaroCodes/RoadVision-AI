import type { KeyboardEvent } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DefectMarker } from '@/features/map/types'
import { defectTypeLabels } from '../labels'
import { SeverityBadge, StatusBadge } from './DefectBadges'

interface DefectsTableProps {
  defects: readonly DefectMarker[]
  onSelect: (defect: DefectMarker) => void
}

export function DefectsTable({ defects, onSelect }: DefectsTableProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, defect: DefectMarker) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(defect)
    }
  }

  return (
    <div className="defects-surface overflow-hidden rounded-xl border shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Критичность</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Уверенность ИИ</TableHead>
              <TableHead className="min-w-56">Адрес</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {defects.map((defect) => (
              <TableRow
                key={defect.id}
                tabIndex={0}
                role="button"
                aria-label={`Редактировать дефект ${defect.id}`}
                onClick={() => onSelect(defect)}
                onKeyDown={(event) => handleKeyDown(event, defect)}
                className="cursor-pointer outline-none transition-colors focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <TableCell className="font-mono text-xs font-semibold">#{defect.id}</TableCell>
                <TableCell className="font-medium">{defectTypeLabels[defect.type]}</TableCell>
                <TableCell><SeverityBadge severity={defect.severity} /></TableCell>
                <TableCell><StatusBadge status={defect.status} /></TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {Math.round(defect.confidence * 100)}%
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {defect.address ?? 'Шымкент'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 p-3 md:hidden">
        {defects.map((defect) => (
          <button type="button" key={defect.id} onClick={() => onSelect(defect)} className="rounded-lg border bg-background p-4 text-left transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Редактировать дефект ${defect.id}`}>
            <span className="flex items-center justify-between gap-3"><span className="font-mono text-xs font-semibold">#{defect.id}</span><StatusBadge status={defect.status} /></span>
            <span className="mt-3 flex items-center justify-between gap-3"><span className="font-medium">{defectTypeLabels[defect.type]}</span><SeverityBadge severity={defect.severity} /></span>
            <span className="mt-3 block truncate text-sm text-muted-foreground">{defect.address ?? 'Шымкент'}</span>
            <span className="mt-2 block text-xs text-muted-foreground">Уверенность ИИ: {Math.round(defect.confidence * 100)}%</span>
          </button>
        ))}
      </div>
    </div>
  )
}
