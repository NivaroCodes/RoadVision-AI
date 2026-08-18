import { useEffect, useState } from "react";

export type Role = "admin" | "road" | "resident";

export type Session = { email: string; role: Role };

export const roleLabel: Record<Role, string> = {
  admin: "Администратор",
  road: "Дорожная служба",
  resident: "Житель",
};

const KEY = "qv.session";
const EVENT = "qv:session";

const defaultSession: Session = { email: "admin.qa@example.com", role: "admin" };

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (parsed && parsed.email && parsed.role in roleLabel) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function setSession(session: Session) {
  window.localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(EVENT));
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useSession(): Session & { authed: boolean; ready: boolean } {
  const [session, set] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      set(readSession());
      setReady(true);
    };
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { ...(session ?? defaultSession), authed: session !== null, ready };
}

export function initials(email: string) {
  return (email.trim()[0] ?? "U").toUpperCase();
}
