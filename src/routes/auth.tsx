import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { QalaMark } from "@/components/roadvision/QalaLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { navItemsForRole } from "@/components/roadvision/Sidebar";
import { roleLabel, setSession, type Role } from "@/lib/session";

const roleChoices: Role[] = ["resident", "road", "admin"];
const roleHint: Record<Role, string> = {
  resident: "Отправка обращений о дефектах",
  road: "Обработка и устранение дефектов",
  admin: "Полный доступ к платформе",
};

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход в систему — Qala Vision" },
      {
        name: "description",
        content:
          "Вход и регистрация в Qala Vision — платформе AI-мониторинга состояния дорожной инфраструктуры.",
      },
      { property: "og:title", content: "Вход в систему — Qala Vision" },
      {
        property: "og:description",
        content: "Доступ к платформе AI-инспекции дорог Qala Vision.",
      },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("resident");

  const isSignup = mode === "signup";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || password.length < 8) {
      toast.error("Проверьте email и пароль (минимум 8 символов).");
      return;
    }
    const nextRole: Role = role;
    setSession({ email, role: nextRole });
    toast.success(
      isSignup ? `Аккаунт создан · ${roleLabel[nextRole]}` : `Вход выполнен · ${roleLabel[nextRole]}`,
    );
    const home = navItemsForRole(nextRole)[0]?.to ?? "/";
    void navigate({ to: home });
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left — brand panel */}
      <section className="relative flex flex-col justify-between overflow-hidden border-b border-border px-7 py-8 lg:border-b-0 lg:border-r lg:px-14 lg:py-10">
        <div className="pointer-events-none absolute -left-24 top-1/3 size-[420px] rounded-full bg-primary/10 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <QalaMark className="size-8" />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Qala <span className="text-primary">Vision</span>
          </span>
        </Link>

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

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[12.5px] font-semibold">
                  Имя и фамилия
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Айдана Сериковна"
                  autoComplete="name"
                  className="h-11 rounded-lg bg-surface/60 text-[13.5px]"
                />
              </div>
            )}

            <div>
                  <div className="text-eyebrow">{isSignup ? "Роль" : "Войти как"}</div>
                  <div className="mt-2 grid gap-2">
                    {roleChoices.map((r) => {
                      const active = role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                            active
                              ? "border-primary/45 bg-primary/10"
                              : "border-border bg-surface/40 hover:border-border-strong",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-4 shrink-0 place-items-center rounded-full border",
                              active ? "border-primary" : "border-border-strong",
                            )}
                          >
                            {active && <span className="size-2 rounded-full bg-primary" />}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={cn(
                                "block text-[13px] font-medium",
                                active ? "text-primary" : "text-foreground",
                              )}
                            >
                              {roleLabel[r]}
                            </span>
                            <span className="block text-[11.5px] text-muted-foreground">
                              {roleHint[r]}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[12.5px] font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
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

            <button
              type="submit"
              className={cn(
                "h-11 w-full rounded-lg bg-primary text-[13.5px] font-semibold text-primary-foreground",
                "shadow-glow transition-opacity hover:opacity-90",
              )}
            >
              {isSignup ? "Создать аккаунт" : "Войти"}
            </button>
          </form>

          <div className="mt-6 text-center text-[12.5px] text-muted-foreground">
            {isSignup ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
            <button
              type="button"
              onClick={() => setMode(isSignup ? "signin" : "signup")}
              className="font-semibold text-primary transition-opacity hover:opacity-80"
            >
              {isSignup ? "Войти" : "Регистрация"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
