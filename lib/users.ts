import { mockUsers } from "@/data/mockUsers";
import type { SafeUser, User, UserRole } from "@/types/user";

const USERS_STORAGE_KEY = "ticket-system:users";

export function normalizeRole(role: string | undefined | null): UserRole {
  switch ((role ?? "").toUpperCase()) {
    case "ADMIN":
      return "ADMIN";
    case "TECNICO":
      return "TECNICO";
    default:
      return "USUARIO";
  }
}

export function normalizeUser(user: Partial<User> & { password?: string }): User {
  return {
    id: Number(user.id ?? 0),
    nombre: String(user.nombre ?? "").trim(),
    email: String(user.email ?? "").trim().toLowerCase(),
    password: String(user.password ?? ""),
    rol: normalizeRole(user.rol),
    createdAt: String(user.createdAt ?? new Date().toISOString())
  };
}

function hasStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function cloneSeedUsers() {
  return mockUsers.map((user) => normalizeUser(user));
}

function sortUsers(users: User[]) {
  return [...users].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

export function toSafeUser(user: User): SafeUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function getUsers(): User[] {
  if (!hasStorage()) {
    return sortUsers(cloneSeedUsers());
  }

  const rawUsers = window.localStorage.getItem(USERS_STORAGE_KEY);

  if (!rawUsers) {
    const seedUsers = sortUsers(cloneSeedUsers());
    saveUsers(seedUsers);
    return seedUsers;
  }

  try {
    const parsedUsers = JSON.parse(rawUsers) as Array<Partial<User>>;
    const normalizedUsers = sortUsers(
      parsedUsers.map((user) => normalizeUser(user))
    );
    saveUsers(normalizedUsers);
    return normalizedUsers;
  } catch {
    const seedUsers = sortUsers(cloneSeedUsers());
    saveUsers(seedUsers);
    return seedUsers;
  }
}

export function saveUsers(users: User[]) {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(sortUsers(users)));
}

export function getUserById(userId: number) {
  return getUsers().find((user) => user.id === userId) ?? null;
}

export function getUsersByRole(role: UserRole) {
  return getUsers().filter((user) => user.rol === role);
}

export function getTechnicians() {
  return getUsersByRole("TECNICO");
}

export function authenticateUser(identifier: string, password: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const users = getUsers();

  const user = users.find((item) => {
    return (
      item.email.toLowerCase() === normalizedIdentifier ||
      item.nombre.toLowerCase() === normalizedIdentifier
    );
  });

  if (!user || user.password !== password) {
    return null;
  }

  return toSafeUser(user);
}

export function registerUser(input: {
  nombre: string;
  email: string;
  password: string;
}) {
  const users = getUsers();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (!input.nombre.trim() || !normalizedEmail || !input.password) {
    throw new Error("Completá todos los campos para registrarte.");
  }

  if (users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
    throw new Error("Ya existe una cuenta con ese correo electrónico.");
  }

  const nextUser: User = {
    id: users.length > 0 ? Math.max(...users.map((item) => item.id)) + 1 : 1,
    nombre: input.nombre.trim(),
    email: normalizedEmail,
    password: input.password,
    rol: "USUARIO",
    createdAt: new Date().toISOString()
  };

  const nextUsers = sortUsers([nextUser, ...users]);
  saveUsers(nextUsers);
  return nextUser;
}

export function updateUserRole(params: {
  userId: number;
  nextRole: UserRole;
  currentUserId: number;
}) {
  const users = getUsers();
  const currentUser = users.find((item) => item.id === params.currentUserId);
  const targetUser = users.find((item) => item.id === params.userId);

  if (!targetUser) {
    throw new Error("No se encontró el usuario seleccionado.");
  }

  const adminCount = users.filter((item) => item.rol === "ADMIN").length;

  if (
    currentUser &&
    currentUser.id === targetUser.id &&
    currentUser.rol === "ADMIN" &&
    params.nextRole !== "ADMIN" &&
    adminCount === 1
  ) {
    throw new Error(
      "No puedes quitarte el rol de administrador porque eres el único administrador."
    );
  }

  const updatedUsers = users.map((item) =>
    item.id === params.userId ? { ...item, rol: params.nextRole } : item
  );
  const updatedUser = updatedUsers.find((item) => item.id === params.userId);

  if (!updatedUser) {
    throw new Error("No se pudo actualizar el rol del usuario.");
  }

  saveUsers(updatedUsers);
  return {
    users: updatedUsers,
    updatedUser
  };
}
