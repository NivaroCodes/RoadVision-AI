import type { DefectMarker } from '@/features/map/types'
import { defectSeverityLabels, defectStatusLabels, defectTypeLabels } from '../labels'

const CSV_HEADERS = ['ID', 'Тип', 'Критичность', 'Статус', 'Уверенность ИИ', 'Адрес']

function escapeCSVValue(value: string | number): string {
  const normalized = String(value).replaceAll('"', '""')
  return /[",\n\r]/.test(normalized) ? `"${normalized}"` : normalized
}

export function createDefectsCSV(defects: readonly DefectMarker[]): string {
  const rows = defects.map((defect) => [
    defect.id,
    defect.type ? defectTypeLabels[defect.type] : 'Ожидает анализа',
    defect.severity ? defectSeverityLabels[defect.severity] : 'Ожидает анализа',
    defectStatusLabels[defect.status],
    defect.confidence === null ? '' : `${Math.round(defect.confidence * 100)}%`,
    defect.address ?? 'Шымкент',
  ])

  return [CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCSVValue).join(','))
    .join('\r\n')
}

export function exportToCSV(defects: readonly DefectMarker[]): void {
  const blob = new Blob([`\uFEFF${createDefectsCSV(defects)}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `jol-scan-defects-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
