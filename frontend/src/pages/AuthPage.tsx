import { useState, type FormEvent } from 'react';
import { AxiosError } from 'axios';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Map, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await (mode === 'login' ? login({ email, password }) : register({ email, password }));
      const destination = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(destination, { replace: true });
    } catch (requestError) {
      const message = requestError instanceof AxiosError
        ? (requestError.response?.data as { detail?: string } | undefined)?.detail
        : undefined;
      setError(message ?? 'Не удалось выполнить запрос. Проверьте данные и соединение.');
    } finally {
      setSubmitting(false);
    }
  }

  const isLogin = mode === 'login';
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="hidden border-r bg-card p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-xl font-bold"><Map className="h-7 w-7" />RoadVision AI</div>
        <div className="max-w-lg">
          <ShieldCheck className="mb-6 h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Безопасное управление дорожной инфраструктурой</h1>
          <p className="mt-4 text-lg text-muted-foreground">Доступ к данным и действиям определяется вашей ролью.</p>
        </div>
        <p className="text-sm text-muted-foreground">RoadVision AI · Шымкент</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={submit} className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-xl sm:p-8">
          <div>
            <h2 className="text-2xl font-bold">{isLogin ? 'Вход в систему' : 'Создание аккаунта'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{isLogin ? 'Введите данные своей учётной записи.' : 'Новый аккаунт будет создан с ролью «Житель».'}</p>
          </div>
          <label className="block space-y-2 text-sm font-medium">Email
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-lg border bg-background px-3" placeholder="name@example.com" />
          </label>
          <label className="block space-y-2 text-sm font-medium">Пароль
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={128} autoComplete={isLogin ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-lg border bg-background pl-3 pr-10" placeholder="Не менее 8 символов" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </label>
          {error && <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <button disabled={submitting} className="h-11 w-full rounded-lg bg-primary font-semibold text-primary-foreground disabled:opacity-60">{submitting ? 'Подождите…' : isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <Link className="font-semibold text-foreground underline-offset-4 hover:underline" to={isLogin ? '/register' : '/login'}>{isLogin ? 'Регистрация' : 'Войти'}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
