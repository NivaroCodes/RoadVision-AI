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
  detected: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  fixed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  rejected: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

export function SeverityBadge({ severity }: { severity: DefectSeverity }) {
  return (
    <Badge variant="outline" className={cn('font-medium', severityStyles[severity])}>
      {defectSeverityLabels[severity]}
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
