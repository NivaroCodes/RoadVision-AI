import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title?: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, title = 'Дефекты не найдены', description = 'Попробуйте изменить параметры фильтрации', className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/80 px-6 py-12 text-center ${className}`} role="status">
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><Icon className="size-6" aria-hidden="true" /></span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
