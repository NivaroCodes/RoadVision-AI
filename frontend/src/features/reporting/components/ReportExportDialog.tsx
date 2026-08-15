import { useMemo, useRef, useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { format, startOfMonth } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { DashboardSummary } from '@/features/dashboard/types'
import type { DefectMarker } from '@/features/map/types'
import { defectSeverityLabels, defectStatusLabels, defectTypeLabels } from '@/features/defects/labels'
import { generatePdf } from '../utils/pdfGenerator'
import type { ReportMode, ReportPeriod } from '../types'

interface ReportExportDialogProps { defects: readonly DefectMarker[]; summary?: DashboardSummary; period?: Partial<ReportPeriod>; triggerClassName?: string }

const REPORT_OPTIONS: Array<{ value: ReportMode; title: string; description: string }> = [
  { value: 'monthly', title: 'Месячная сводка', description: 'Итоги за текущий месяц' },
  { value: 'filtered', title: 'Выбранные дефекты', description: 'Текущий набор реестра' },
  { value: 'date-range', title: 'Фильтр дат', description: 'Произвольный период отчёта' },
]

export function ReportExportDialog({ defects, summary, period, triggerClassName }: ReportExportDialogProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ReportMode>('monthly')
  const [from, setFrom] = useState(period?.from ?? format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [to, setTo] = useState(period?.to ?? today)
  const [isGenerating, setIsGenerating] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const totals = useMemo(() => summary ?? { total_defects: defects.length, critical_defects: defects.filter((item) => item.severity === 'critical').length, fixed_defects: defects.filter((item) => item.status === 'fixed').length, in_progress_defects: defects.filter((item) => item.status === 'in_progress').length }, [defects, summary])
  const severityCounts = useMemo(() => ({ low: defects.filter((item) => item.severity === 'low').length, medium: defects.filter((item) => item.severity === 'medium').length, high: defects.filter((item) => item.severity === 'high').length, critical: defects.filter((item) => item.severity === 'critical').length }), [defects])
  const reportPeriod = mode === 'monthly' ? `${format(startOfMonth(new Date()), 'dd.MM.yyyy')} — ${format(new Date(), 'dd.MM.yyyy')}` : mode === 'date-range' ? `${format(new Date(`${from}T00:00:00`), 'dd.MM.yyyy')} — ${format(new Date(`${to}T00:00:00`), 'dd.MM.yyyy')}` : 'Текущая выборка реестра'

  const handleExport = async () => {
    if (!reportRef.current) return
    setIsGenerating(true)
    try {
      await generatePdf({ element: reportRef.current, filename: `roadvision-report-${today}.pdf` })
      setOpen(false)
    } finally { setIsGenerating(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className={triggerClassName} />}><FileText data-icon="inline-start" aria-hidden="true" />Экспорт отчёта</DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>Экспорт PDF-отчёта</DialogTitle><DialogDescription>Выберите состав и период документа. Генерация выполняется только в браузере.</DialogDescription></DialogHeader>
        <fieldset className="grid gap-2"><legend className="mb-1 text-sm font-medium">Тип отчёта</legend>{REPORT_OPTIONS.map((option) => <label key={option.value} className="flex cursor-pointer gap-3 rounded-lg border p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5"><input type="radio" name="report-mode" value={option.value} checked={mode === option.value} onChange={() => setMode(option.value)} className="mt-1" /><span><span className="block font-medium">{option.title}</span><span className="text-xs text-muted-foreground">{option.description}</span></span></label>)}</fieldset>
        {mode === 'date-range' ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium">С даты<input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="h-10 rounded-md border bg-background px-3 font-normal" /></label><label className="grid gap-1.5 text-sm font-medium">По дату<input type="date" value={to} min={from} max={today} onChange={(event) => setTo(event.target.value)} className="h-10 rounded-md border bg-background px-3 font-normal" /></label></div> : null}
        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">В отчёт попадут сводные показатели, диаграмма критичности и таблица из {defects.length} дефектов.</div>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>Отмена</Button><Button onClick={handleExport} disabled={isGenerating || defects.length === 0}>{isGenerating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : <Download data-icon="inline-start" aria-hidden="true" />}{isGenerating ? 'Создание PDF…' : 'Скачать PDF'}</Button></DialogFooter>
        <div className="fixed left-[-10000px] top-0 w-[794px] bg-white p-12 font-sans text-zinc-950" ref={reportRef} aria-hidden="true">
          <div className="flex items-center justify-between border-b-2 border-zinc-950 pb-5"><div><p className="text-2xl font-black">RoadVision AI</p><p className="mt-1 text-sm text-zinc-500">Мониторинг дорожных дефектов</p></div><div className="text-right text-sm"><p className="font-semibold">Отчёт по дефектам</p><p className="text-zinc-500">{reportPeriod}</p></div></div>
          <div className="mt-7 grid grid-cols-4 gap-3">{[['Всего', totals.total_defects], ['Критические', totals.critical_defects], ['В работе', totals.in_progress_defects], ['Исправлено', totals.fixed_defects]].map(([label, value]) => <div key={label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"><p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>
          <section className="mt-8"><h2 className="text-lg font-bold">Распределение по критичности</h2><div className="mt-4 grid grid-cols-4 gap-3">{Object.entries(severityCounts).map(([severity, count]) => { const width = defects.length === 0 ? 0 : Math.max(4, (count / defects.length) * 100); return <div key={severity}><div className="flex justify-between text-xs"><span>{defectSeverityLabels[severity as keyof typeof defectSeverityLabels]}</span><strong>{count}</strong></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-200"><div className="h-full rounded-full bg-zinc-800" style={{ width: `${width}%` }} /></div></div> })}</div></section>
          <section className="mt-8"><h2 className="text-lg font-bold">Реестр дефектов</h2><table className="mt-4 w-full border-collapse text-left text-[11px]"><thead><tr className="bg-zinc-900 text-white"><th className="p-2">ID</th><th className="p-2">Тип</th><th className="p-2">Критичность</th><th className="p-2">Статус</th><th className="p-2">Адрес</th><th className="p-2 text-right">ИИ</th></tr></thead><tbody>{defects.map((defect) => <tr key={defect.id} className="border-b border-zinc-200"><td className="p-2 font-mono">#{defect.id}</td><td className="p-2">{defectTypeLabels[defect.type]}</td><td className="p-2">{defectSeverityLabels[defect.severity]}</td><td className="p-2">{defectStatusLabels[defect.status]}</td><td className="max-w-48 p-2">{defect.address ?? 'Шымкент'}</td><td className="p-2 text-right">{Math.round(defect.confidence * 100)}%</td></tr>)}</tbody></table></section>
          <p className="mt-8 border-t border-zinc-200 pt-4 text-center text-[10px] text-zinc-400">Сформировано {format(new Date(), 'dd.MM.yyyy HH:mm')} · RoadVision AI</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
