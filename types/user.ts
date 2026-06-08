export const USER_ROLES = ["ADMIN", "TECNICO", "USUARIO"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type User = {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  createdAt: string;
};

export type SafeUser = Omit<User, "password">;
