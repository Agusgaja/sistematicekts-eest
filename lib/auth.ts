import type { SafeUser, UserRole } from "@/types/user";
import {
  authenticateUser,
  normalizeRole,
  normalizeUser,
  toSafeUser
} from "@/lib/users";

const AUTH_STORAGE_KEY = "ticket-system:session";

function hasStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function authenticate(identifier: string, password: string) {
  return authenticateUser(identifier, password);
}

export function saveSession(user: SafeUser) {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function getSession(): SafeUser | null {
  if (!hasStorage()) {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as SafeUser & {
      rol?: string;
    };
    const normalizedSession = normalizeUser({
      ...parsedSession,
      password: "",
      rol: normalizeRole(parsedSession.rol)
    });

    saveSession(toSafeUser(normalizedSession));
    return toSafeUser(normalizedSession);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearSession() {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function roleHomePath(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TECNICO":
      return "/tecnico";
    default:
      return "/dashboard";
  }
}
