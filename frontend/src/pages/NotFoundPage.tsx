import { ArrowLeft, MapPinned } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 px-6 py-16 text-white shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_48%)]" aria-hidden="true" />
      <div className="relative max-w-xl text-center">
        <span className="mx-auto mb-6 inline-flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400"><MapPinned className="size-7" aria-hidden="true" /></span>
        <p className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-8xl font-black tracking-tighter text-transparent sm:text-9xl">404</p>
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">Страница не найдена</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400 sm:text-base">Возможно, адрес изменился или такой страницы больше не существует.</p>
        <Button asChild className="mt-8 min-h-11 px-5">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Вернуться на главную
          </Link>
        </Button>
      </div>
    </main>
  )
}
