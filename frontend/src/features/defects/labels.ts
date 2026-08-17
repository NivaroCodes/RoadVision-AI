import type { DefectSeverity, DefectStatus, DefectType } from '@/features/map/types'

export const defectTypeLabels: Record<DefectType, string> = {
  crack: 'Трещина',
  pothole: 'Яма',
  net: 'Сеточная трещина',
  road_collapse: 'Обрушение дороги',
  damaged_manhole: 'Повреждённый люк',
  other: 'Другой дефект',
}

export const defectSeverityLabels: Record<DefectSeverity, string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
  critical: 'Критическая',
}

export const defectStatusLabels: Record<DefectStatus, string> = {
  submitted: 'Ожидает анализа',
  detected: 'Обнаружено',
  in_progress: 'В работе',
  fixed: 'Исправлено',
  verified: 'Проверено',
  rejected: 'Отклонено',
}
