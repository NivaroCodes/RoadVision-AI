import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DefectMarker, DefectSeverity, DefectStatus } from '@/features/map/types'
import { defectSeverityLabels, defectStatusLabels, defectTypeLabels } from '../labels'
import { useUpdateDefect } from '../hooks/useUpdateDefect'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'

interface DefectEditDialogProps {
  defect: DefectMarker | null
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

const statusTransitions: Record<DefectStatus, DefectStatus[]> = {
  submitted: ['detected', 'rejected'],
  detected: ['in_progress', 'rejected'],
  in_progress: ['fixed'],
  fixed: ['verified', 'in_progress'],
  verified: [],
  rejected: [],
}

export function DefectEditDialog({ defect, onOpenChange, onSave }: DefectEditDialogProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<DefectStatus>('detected')
  const [severity, setSeverity] = useState<DefectSeverity | null>(null)

  useEffect(() => {
    if (defect) {
      setStatus(defect.status)
      setSeverity(defect.severity)
    }
  }, [defect])

  const updateMutation = useUpdateDefect()
  const availableStatuses = [
    status,
    ...statusTransitions[status].filter((value) => value !== 'verified' || user?.role === 'admin'),
  ]

  const handleSave = () => {
    if (!defect) return
    const data = user?.role === 'admin' && severity
      ? { status, severity }
      : { status }
    updateMutation.mutate(
      { id: defect.id, data },
      { onSuccess: () => onSave() }
    )
  }

  return (
    <Dialog open={defect !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактирование дефекта #{defect?.id}</DialogTitle>
          <DialogDescription>
            {defect ? `${defect.type ? defectTypeLabels[defect.type] : 'Ожидает анализа'} · ${defect.address ?? 'Шымкент'}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {updateMutation.isError && (
            <div className="rounded-md border border-red-900 bg-red-950/60 p-3 text-sm font-medium text-red-200" role="alert">
              Ошибка сохранения. Попробуйте еще раз.
            </div>
          )}
          <label className="grid gap-2" htmlFor="defect-status">
            <span className="text-sm font-medium text-neutral-200">Статус</span>
            <Select value={status} onValueChange={(value) => setStatus(value as DefectStatus)}>
              <SelectTrigger id="defect-status" className="h-11 w-full border-neutral-700 bg-neutral-950 text-neutral-100 hover:bg-neutral-900">
                <SelectValue>{defectStatusLabels[status]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="defects-select-content">
                {availableStatuses.map((value) => (
                  <SelectItem key={value} value={value}>{defectStatusLabels[value]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {user?.role === 'admin' ? <label className="grid gap-2" htmlFor="defect-severity">
            <span className="text-sm font-medium text-neutral-200">Критичность</span>
            <Select value={severity ?? ''} onValueChange={(value) => setSeverity(value as DefectSeverity)}>
              <SelectTrigger id="defect-severity" className="h-11 w-full border-neutral-700 bg-neutral-950 text-neutral-100 hover:bg-neutral-900">
                <SelectValue>{severity ? defectSeverityLabels[severity] : 'Ожидает анализа'}</SelectValue>
              </SelectTrigger>
              <SelectContent className="defects-select-content">
                {Object.entries(defectSeverityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label> : null}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" className="w-full border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800 hover:text-white sm:w-auto" disabled={updateMutation.isPending} />}>Отмена</DialogClose>
          <Button className="w-full bg-white text-black hover:bg-neutral-200 sm:w-auto" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
