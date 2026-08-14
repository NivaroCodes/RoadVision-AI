import type { DefectSeverity, DefectStatus, DefectType } from '@/features/map/types'

export const defectTypeLabels: Record<DefectType, string> = {
  crack: 'Трещина',
  pothole: 'Яма',
  net: 'Сеточная трещина',
}

export const defectSeverityLabels: Record<DefectSeverity, string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
}

export const defectStatusLabels: Record<DefectStatus, string> = {
  detected: 'Обнаружено',
  in_progress: 'В работе',
  fixed: 'Исправлено',
}
