import { DefectsRegistry } from '@/features/defects'

export default function DefectsPage() {
  return (
    <div className="defects-page -m-4 min-h-[calc(100vh-4rem)] space-y-5 p-4 animate-in fade-in duration-500 sm:-m-6 sm:space-y-6 sm:p-6 lg:-m-8 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Журнал дефектов</h1>
        <p className="mt-2 text-muted-foreground">
          Просмотр и управление обнаруженными дорожными дефектами.
        </p>
      </div>
      <DefectsRegistry />
    </div>
  )
}
