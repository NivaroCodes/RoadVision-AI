import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10">
          <ShieldX className="size-7 text-destructive" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Доступ запрещён</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          У вашей роли нет прав для доступа к этому разделу платформы.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
