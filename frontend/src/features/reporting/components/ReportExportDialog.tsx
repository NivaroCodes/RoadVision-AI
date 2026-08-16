import { useMemo, useRef, useState } from 'react'
import { AlertCircle, Download, FileText, Loader2 } from 'lucide-react'
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
  { value: 'filtered', title: 'Текущий список', description: 'Все переданные в отчёт данные' },
  { value: 'date-range', title: 'Фильтр дат', description: 'Произвольный период отчёта' },
]

export function ReportExportDialog({ defects, summary, period, triggerClassName }: ReportExportDialogProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ReportMode>('monthly')
  const [from, setFrom] = useState(period?.from ?? format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [to, setTo] = useState(period?.to ?? today)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)
  const filteredData = useMemo(() => {
    if (mode === 'filtered') return defects;
    return defects.filter(defect => {
      if (!defect.created_at) return true;
      const defectDate = new Date(defect.created_at);
      if (isNaN(defectDate.getTime())) return true;
      if (mode === 'monthly') {
        const start = startOfMonth(new Date());
        return defectDate >= start;
      }
      if (mode === 'date-range') {
        const fromDate = new Date(`${from}T00:00:00`);
        const toDate = new Date(`${to}T23:59:59`);
        return defectDate >= fromDate && defectDate <= toDate;
      }
      return true;
    });
  }, [defects, mode, from, to])

  const totals = useMemo(() => (summary && mode === 'filtered') ? summary : { total_defects: filteredData.length, critical_defects: filteredData.filter((item) => item.severity === 'critical').length, fixed_defects: filteredData.filter((item) => item.status === 'fixed').length, in_progress_defects: filteredData.filter((item) => item.status === 'in_progress').length }, [filteredData, summary, mode])
  const severityCounts = useMemo(() => ({ low: filteredData.filter((item) => item.severity === 'low').length, medium: filteredData.filter((item) => item.severity === 'medium').length, high: filteredData.filter((item) => item.severity === 'high').length, critical: filteredData.filter((item) => item.severity === 'critical').length }), [filteredData])
  const reportPeriod = mode === 'monthly' ? `${format(startOfMonth(new Date()), 'dd.MM.yyyy')} — ${format(new Date(), 'dd.MM.yyyy')}` : mode === 'date-range' ? `${format(new Date(`${from}T00:00:00`), 'dd.MM.yyyy')} — ${format(new Date(`${to}T00:00:00`), 'dd.MM.yyyy')}` : 'Текущая выборка реестра'

  const handleExport = async () => {
    if (!reportRef.current) return
    setGenerationError(null)
    setIsGenerating(true)
    try {
      await generatePdf({ element: reportRef.current, filename: `roadvision-report-${today}.pdf` })
      setOpen(false)
    } catch {
      setGenerationError('Не удалось сформировать PDF. Попробуйте ещё раз.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setGenerationError(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" className={triggerClassName} />}><FileText data-icon="inline-start" aria-hidden="true" />Экспорт отчёта</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>Экспорт PDF-отчёта</DialogTitle><DialogDescription>Выберите состав и период документа. Генерация выполняется только в браузере.</DialogDescription></DialogHeader>
        <fieldset className="grid gap-2"><legend className="mb-1 text-sm font-medium text-neutral-200">Тип отчёта</legend>{REPORT_OPTIONS.map((option) => <label key={option.value} className="flex min-h-16 cursor-pointer gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900 has-[:checked]:border-neutral-500 has-[:checked]:bg-neutral-900"><input type="radio" name="report-mode" value={option.value} checked={mode === option.value} onChange={() => setMode(option.value)} className="mt-1 accent-white" /><span><span className="block font-medium text-neutral-100">{option.title}</span><span className="text-xs text-neutral-400">{option.description}</span></span></label>)}</fieldset>
        {mode === 'date-range' ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium text-neutral-200">С даты<input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="h-11 min-w-0 rounded-md border border-neutral-700 bg-neutral-950 px-3 font-normal text-white [color-scheme:dark] focus-visible:border-neutral-400" /></label><label className="grid gap-1.5 text-sm font-medium text-neutral-200">По дату<input type="date" value={to} min={from} max={today} onChange={(event) => setTo(event.target.value)} className="h-11 min-w-0 rounded-md border border-neutral-700 bg-neutral-950 px-3 font-normal text-white [color-scheme:dark] focus-visible:border-neutral-400" /></label></div> : null}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm leading-relaxed text-neutral-300">В отчёт попадут сводные показатели, диаграмма критичности и таблица из {filteredData.length} дефектов.</div>
        {generationError ? <div className="flex items-start gap-2 rounded-lg border border-red-900 bg-red-950/60 p-3 text-sm text-red-200" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{generationError}</div> : null}
        <DialogFooter><Button variant="outline" className="w-full border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800 hover:text-white sm:w-auto" onClick={() => setOpen(false)} disabled={isGenerating}>Отмена</Button><Button className="w-full bg-white text-black hover:bg-neutral-200 sm:w-auto" onClick={handleExport} disabled={isGenerating || filteredData.length === 0}>{isGenerating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : <Download data-icon="inline-start" aria-hidden="true" />}{isGenerating ? 'Создание PDF…' : 'Скачать PDF'}</Button></DialogFooter>
        <div className="fixed left-[-10000px] top-0 w-[794px] bg-white p-12 font-sans text-zinc-950" ref={reportRef} aria-hidden="true">
          <div className="flex items-center justify-between border-b-2 border-zinc-950 pb-5"><div><p className="text-2xl font-black">RoadVision AI</p><p className="mt-1 text-sm text-zinc-500">Мониторинг дорожных дефектов</p></div><div className="text-right text-sm"><p className="font-semibold">Отчёт по дефектам</p><p className="text-zinc-500">{reportPeriod}</p></div></div>
          <div className="mt-7 grid grid-cols-4 gap-3">{[['Всего', totals.total_defects], ['Критические', totals.critical_defects], ['В работе', totals.in_progress_defects], ['Исправлено', totals.fixed_defects]].map(([label, value]) => <div key={label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"><p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>
          <section className="mt-8"><h2 className="text-lg font-bold">Распределение по критичности</h2><div className="mt-4 grid grid-cols-4 gap-3">{Object.entries(severityCounts).map(([severity, count]) => { const width = filteredData.length === 0 ? 0 : Math.max(4, (count / filteredData.length) * 100); return <div key={severity}><div className="flex justify-between text-xs"><span>{defectSeverityLabels[severity as keyof typeof defectSeverityLabels]}</span><strong>{count}</strong></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-200"><div className="h-full rounded-full bg-zinc-800" style={{ width: `${width}%` }} /></div></div> })}</div></section>
          <section className="mt-8"><h2 className="text-lg font-bold">Реестр дефектов</h2><table className="mt-4 w-full border-collapse text-left text-[11px]"><thead><tr className="bg-zinc-900 text-white"><th className="p-2">ID</th><th className="p-2">Тип</th><th className="p-2">Критичность</th><th className="p-2">Статус</th><th className="p-2">Адрес</th><th className="p-2 text-right">ИИ</th></tr></thead><tbody>{filteredData.map((defect) => <tr key={defect.id} className="border-b border-zinc-200"><td className="p-2 font-mono">#{defect.id}</td><td className="p-2">{defectTypeLabels[defect.type]}</td><td className="p-2">{defectSeverityLabels[defect.severity]}</td><td className="p-2">{defectStatusLabels[defect.status]}</td><td className="max-w-48 p-2">{defect.address ?? 'Шымкент'}</td><td className="p-2 text-right">{Math.round(defect.confidence * 100)}%</td></tr>)}</tbody></table></section>
          <p className="mt-8 border-t border-zinc-200 pt-4 text-center text-[10px] text-zinc-400">Сформировано {format(new Date(), 'dd.MM.yyyy HH:mm')} · RoadVision AI</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
