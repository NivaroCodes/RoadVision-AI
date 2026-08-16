import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export default function AccessDeniedPage() {
  return <div className="grid min-h-[60vh] place-items-center text-center"><div><ShieldX className="mx-auto h-14 w-14 text-destructive" /><h1 className="mt-5 text-3xl font-bold">Доступ запрещён</h1><p className="mt-2 text-muted-foreground">У вашей роли нет доступа к этому разделу.</p><Link to="/" className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground">На главную</Link></div></div>;
}
