import { useState, type FormEvent } from 'react';
import { AxiosError } from 'axios';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/useAuth';
import { QalaMark } from '@/components/layout/QalaLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function getApiErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === 'string') return detail;
  if (!Array.isArray(detail)) return undefined;
  const messages = detail
    .map((item) => {
      if (!item || typeof item !== 'object') return undefined;
      const message = (item as { msg?: unknown }).msg;
      return typeof message === 'string' ? message : undefined;
    })
    .filter((message): message is string => Boolean(message));
  return messages.length > 0 ? messages.join(' ') : undefined;
}

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
    if (!email || password.length < 8) {
      toast.error('Проверьте email и пароль (минимум 8 символов).');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password });
      }
      const destination = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(destination, { replace: true });
    } catch (requestError) {
      const message = requestError instanceof AxiosError
        ? getApiErrorMessage(requestError.response?.data)
        : undefined;
      const errMsg = message ?? 'Не удалось выполнить запрос. Проверьте данные и соединение.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  }

  const isSignup = mode === 'register';

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left — brand panel with vibrant green glow / radial trail */}
      <section className="relative flex flex-col justify-between overflow-hidden border-b border-border px-7 py-8 lg:border-b-0 lg:border-r lg:px-14 lg:py-10">
        {/* Glowing green trail / aura */}
        <div
          className="pointer-events-none absolute -left-20 top-1/4 size-[560px] rounded-full blur-[110px]"
          style={{
            background: 'radial-gradient(circle, rgba(155, 239, 24, 0.28) 0%, rgba(155, 239, 24, 0.12) 45%, rgba(155, 239, 24, 0) 75%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/4 top-2/3 size-[400px] rounded-full blur-[95px]"
          style={{
            background: 'radial-gradient(circle, rgba(155, 239, 24, 0.16) 0%, rgba(155, 239, 24, 0) 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-2.5">
          <QalaMark className="size-8" />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Qala <span className="text-primary">Vision</span>
          </span>
        </div>

        <div className="relative max-w-xl py-12">
          <div className="grid size-11 place-items-center rounded-xl border border-border bg-card">
            <ShieldCheck className="size-[22px] text-primary" strokeWidth={1.9} />
          </div>
          <h1 className="mt-7 text-[34px] font-semibold leading-[1.12] tracking-tight text-foreground lg:text-[42px]">
            Безопасное управление
            <br />
            дорожной инфраструктурой
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Доступ к данным и действиям определяется вашей ролью.
          </p>
        </div>

        <div className="relative text-[12.5px] text-muted-foreground">
          Qala Vision · Шымкент
        </div>
      </section>

      {/* Right — auth card */}
      <section className="flex items-center justify-center px-5 py-12 lg:px-10">
        <div className="panel w-full max-w-[420px] p-7 sm:p-8">
          <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
            {isSignup ? "Регистрация" : "Вход в систему"}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {isSignup
              ? "Создайте учётную запись для доступа к платформе."
              : "Введите данные своей учётной записи."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[12.5px] font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="h-11 rounded-lg bg-surface/60 text-[13.5px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[12.5px] font-semibold">
                Пароль
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Не менее 8 символов"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className="h-11 rounded-lg bg-surface/60 pr-11 text-[13.5px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {!isSignup && (
                <div className="pt-0.5 text-right">
                  <button
                    type="button"
                    onClick={() => toast.info("Обратитесь к администратору рабочей области.")}
                    className="text-[12px] text-muted-foreground transition-colors hover:text-primary"
                  >
                    Забыли пароль?
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-[12.5px] text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "h-11 w-full rounded-lg bg-primary text-[13.5px] font-semibold text-primary-foreground",
                "shadow-glow transition-opacity hover:opacity-90 disabled:opacity-60"
              )}
            >
              {submitting ? "Подождите…" : isSignup ? "Создать аккаунт" : "Войти"}
            </button>
          </form>

          <div className="mt-6 text-center text-[12.5px] text-muted-foreground">
            {isSignup ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
            <Link
              to={isSignup ? "/login" : "/register"}
              className="font-semibold text-primary transition-opacity hover:opacity-80"
            >
              {isSignup ? "Войти" : "Регистрация"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
