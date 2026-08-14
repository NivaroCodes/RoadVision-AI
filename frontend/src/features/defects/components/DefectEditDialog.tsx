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

interface DefectEditDialogProps {
  defect: DefectMarker | null
  onOpenChange: (open: boolean) => void
  onSave: (defect: DefectMarker) => void
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

  const handleSave = () => {
    if (!defect) return
    onSave({ ...defect, status, severity })
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
          <DialogClose render={<Button variant="outline" />}>Отмена</DialogClose>
          <Button className="defects-primary-button" onClick={handleSave}>Сохранить изменения</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
