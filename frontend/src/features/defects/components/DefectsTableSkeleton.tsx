import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function DefectsTableSkeleton() {
  return (
    <div className="defects-surface overflow-hidden rounded-xl border shadow-sm" aria-label="Загрузка реестра дефектов" role="status">
      <div className="hidden overflow-x-auto md:block">
        <Table><TableHeader><TableRow className="hover:bg-transparent">{['ID', 'Тип', 'Критичность', 'Статус', 'Уверенность ИИ', 'Адрес'].map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{Array.from({ length: 6 }).map((_, row) => <TableRow key={row}>{Array.from({ length: 6 }).map((__, cell) => <TableCell key={cell}><Skeleton className="h-4 w-full max-w-28" /></TableCell>)}</TableRow>)}</TableBody>
        </Table>
      </div>
      <div className="grid gap-3 p-4 md:hidden">{Array.from({ length: 4 }).map((_, index) => <div className="rounded-lg border p-4" key={index}><div className="flex items-center justify-between"><Skeleton className="h-4 w-14" /><Skeleton className="h-5 w-24" /></div><Skeleton className="mt-4 h-4 w-2/3" /><Skeleton className="mt-3 h-4 w-full" /></div>)}</div>
      <span className="sr-only">Загрузка данных…</span>
    </div>
  )
}
