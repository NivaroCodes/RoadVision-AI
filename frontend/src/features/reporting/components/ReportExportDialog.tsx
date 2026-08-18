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
import { cn } from '@/lib/utils'

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
    setGenerationError(null)
    setIsGenerating(true)
    try {
      await generatePdf({
        filename: `qala-vision-report-${today}.pdf`,
        data: {
          filename: `qala-vision-report-${today}.pdf`,
          period: reportPeriod,
          totals,
          severityCounts,
          defects: filteredData,
        },
      })
      setOpen(false)
    } catch (err) {
      console.error('PDF Export Error:', err)
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
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground/90 transition-colors hover:border-border-strong hover:bg-surface",
            triggerClassName
          )}
        >
          <FileText className="size-3.5 text-muted-foreground" aria-hidden="true" />
          Экспорт отчёта
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-foreground">Экспорт PDF-отчёта</DialogTitle>
          <DialogDescription className="text-[12.5px] text-muted-foreground">Выберите состав и период документа. Генерация выполняется в браузере.</DialogDescription>
        </DialogHeader>
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-[12.5px] font-medium text-foreground">Тип отчёта</legend>
          {REPORT_OPTIONS.map((option) => (
            <label key={option.value} className="flex min-h-14 cursor-pointer gap-3 rounded-lg border border-border bg-surface/50 p-3 transition-colors hover:border-border-strong hover:bg-surface has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
              <input type="radio" name="report-mode" value={option.value} checked={mode === option.value} onChange={() => setMode(option.value)} className="mt-1 accent-primary" />
              <span>
                <span className="block text-[13px] font-medium text-foreground">{option.title}</span>
                <span className="text-[11.5px] text-muted-foreground">{option.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {mode === 'date-range' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
              С даты
              <input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="h-10 min-w-0 rounded-lg border border-border bg-surface/60 px-3 text-[13px] text-foreground [color-scheme:dark] focus-visible:border-ring" />
            </label>
            <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
              По дату
              <input type="date" value={to} min={from} max={today} onChange={(event) => setTo(event.target.value)} className="h-10 min-w-0 rounded-lg border border-border bg-surface/60 px-3 text-[13px] text-foreground [color-scheme:dark] focus-visible:border-ring" />
            </label>
          </div>
        ) : null}
        <div className="rounded-lg border border-border bg-surface/40 p-3 text-[12px] leading-relaxed text-muted-foreground">
          В отчёт попадут сводные показатели, диаграмма критичности и таблица из {filteredData.length} дефектов.
        </div>
        {generationError ? (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-[12.5px] text-destructive" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{generationError}
          </div>
        ) : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="w-full border-border bg-surface/50 text-foreground hover:bg-surface sm:w-auto" onClick={() => setOpen(false)} disabled={isGenerating}>Отмена</Button>
          <Button className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold shadow-glow sm:w-auto" onClick={handleExport} disabled={isGenerating || filteredData.length === 0}>
            {isGenerating ? <Loader2 data-icon="inline-start" className="size-4 animate-spin mr-2" aria-hidden="true" /> : <Download data-icon="inline-start" className="size-4 mr-2" aria-hidden="true" />}
            {isGenerating ? 'Создание PDF…' : 'Скачать PDF'}
          </Button>
        </DialogFooter>
        <div className="fixed left-[-10000px] top-0 w-[794px] bg-white p-12 font-sans text-zinc-950" ref={reportRef} aria-hidden="true">
          <div className="flex items-center justify-between border-b-2 border-zinc-950 pb-5">
            <div><p className="text-2xl font-black">Qala Vision</p><p className="mt-1 text-sm text-zinc-500">AI-мониторинг дорожной инфраструктуры</p></div>
            <div className="text-right text-sm"><p className="font-semibold">Отчёт по дефектам</p><p className="text-zinc-500">{reportPeriod}</p></div>
          </div>
          <div className="mt-7 grid grid-cols-4 gap-3">{[['Всего', totals.total_defects], ['Критические', totals.critical_defects], ['В работе', totals.in_progress_defects], ['Устранено', totals.fixed_defects]].map(([label, value]) => <div key={label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"><p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>
          <section className="mt-8"><h2 className="text-lg font-bold">Распределение по критичности</h2><div className="mt-4 grid grid-cols-4 gap-3">{Object.entries(severityCounts).map(([severity, count]) => { const width = filteredData.length === 0 ? 0 : Math.max(4, (count / filteredData.length) * 100); return <div key={severity}><div className="flex justify-between text-xs"><span>{defectSeverityLabels[severity as keyof typeof defectSeverityLabels]}</span><strong>{count}</strong></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-200"><div className="h-full rounded-full bg-zinc-800" style={{ width: `${width}%` }} /></div></div> })}</div></section>
          <section className="mt-8"><h2 className="text-lg font-bold">Реестр дефектов</h2><table className="mt-4 w-full border-collapse text-left text-[11px]"><thead><tr className="bg-zinc-900 text-white"><th className="p-2">ID</th><th className="p-2">Тип</th><th className="p-2">Критичность</th><th className="p-2">Статус</th><th className="p-2">Адрес</th><th className="p-2 text-right">ИИ</th></tr></thead><tbody>{filteredData.map((defect) => <tr key={defect.id} className="border-b border-zinc-200"><td className="p-2 font-mono">#{defect.id}</td><td className="p-2">{defect.type ? defectTypeLabels[defect.type] : 'Ожидает анализа'}</td><td className="p-2">{defect.severity ? defectSeverityLabels[defect.severity] : 'Ожидает анализа'}</td><td className="p-2">{defectStatusLabels[defect.status]}</td><td className="max-w-48 p-2">{defect.address ?? 'Шымкент'}</td><td className="p-2 text-right">{defect.confidence === null ? '—' : `${Math.round(defect.confidence * 100)}%`}</td></tr>)}</tbody></table></section>
          <p className="mt-8 border-t border-zinc-200 pt-4 text-center text-[10px] text-zinc-400">Сформировано {format(new Date(), 'dd.MM.yyyy HH:mm')} · Qala Vision</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
