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

interface DefectEditDialogProps {
  defect: DefectMarker | null
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function DefectEditDialog({ defect, onOpenChange, onSave }: DefectEditDialogProps) {
  const [status, setStatus] = useState<DefectStatus>('detected')
  const [severity, setSeverity] = useState<DefectSeverity>('low')

  useEffect(() => {
    if (defect) {
      setStatus(defect.status)
      setSeverity(defect.severity)
    }
  }, [defect])

  const updateMutation = useUpdateDefect()

  const handleSave = () => {
    if (!defect) return
    updateMutation.mutate(
      { id: defect.id, data: { status, severity } },
      { onSuccess: () => onSave() }
    )
  }

  return (
    <Dialog open={defect !== null} onOpenChange={onOpenChange}>
      <DialogContent className="defects-dialog border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактирование дефекта #{defect?.id}</DialogTitle>
          <DialogDescription>
            {defect ? `${defectTypeLabels[defect.type]} · ${defect.address ?? 'Шымкент'}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {updateMutation.isError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
              Ошибка сохранения. Попробуйте еще раз.
            </div>
          )}
          <label className="grid gap-2" htmlFor="defect-status">
            <span className="text-sm font-medium">Статус</span>
            <Select value={status} onValueChange={(value) => setStatus(value as DefectStatus)}>
              <SelectTrigger id="defect-status" className="w-full">
                <SelectValue>{defectStatusLabels[status]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="defects-select-content">
                {Object.entries(defectStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-2" htmlFor="defect-severity">
            <span className="text-sm font-medium">Критичность</span>
            <Select value={severity} onValueChange={(value) => setSeverity(value as DefectSeverity)}>
              <SelectTrigger id="defect-severity" className="w-full">
                <SelectValue>{defectSeverityLabels[severity]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="defects-select-content">
                {Object.entries(defectSeverityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        <DialogFooter className="defects-dialog-footer">
          <DialogClose render={<Button variant="outline" disabled={updateMutation.isPending} />}>Отмена</DialogClose>
          <Button className="defects-primary-button" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
