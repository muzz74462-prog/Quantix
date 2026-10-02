/**
 * Front-end-only "session" used by the prototype. It only remembers what the user typed
 * at signup so the Account panel can show it. The password is deliberately NEVER stored.
 */
export type DemoUser = { email: string; country: string; currency: string };

const KEY = "quantix:demo-user";

export function saveDemoUser(user: DemoUser): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable: the Account panel will just show an empty state */
  }
}

export function loadDemoUser(): DemoUser | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<DemoUser>;
    return typeof v.email === "string" ? { email: v.email, country: v.country ?? "", currency: v.currency ?? "USD" } : null;
  } catch {
    return null;
  }
}

export function clearDemoUser(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
