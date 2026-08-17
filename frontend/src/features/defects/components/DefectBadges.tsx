import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DefectSeverity, DefectStatus } from '@/features/map/types'
import { defectSeverityLabels, defectStatusLabels } from '../labels'

const severityStyles: Record<DefectSeverity, string> = {
  low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  medium: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  high: 'border-red-500/30 bg-red-500/10 text-red-400',
  critical: 'border-rose-600/50 bg-rose-600/20 text-rose-500 font-bold uppercase',
}

const statusStyles: Record<DefectStatus, string> = {
  submitted: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  detected: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  fixed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  verified: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
  rejected: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

export function SeverityBadge({ severity }: { severity: DefectSeverity | null }) {
  return (
    <Badge variant="outline" className={cn('font-medium', severity ? severityStyles[severity] : 'border-violet-500/30 text-violet-400')}>
      {severity ? defectSeverityLabels[severity] : 'Ожидает анализа'}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: DefectStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', statusStyles[status])}>
      {defectStatusLabels[status]}
    </Badge>
  )
}
