import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Страница не найдена</h2>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="size-4" /> На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
