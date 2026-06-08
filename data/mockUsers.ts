import type { User } from "@/types/user";

export const mockUsers: User[] = [
  {
    id: 1,
    nombre: "Administrador",
    email: "admin@test.com",
    password: "123456",
    rol: "ADMIN",
    createdAt: "2026-05-01T09:00:00-03:00"
  },
  {
    id: 2,
    nombre: "Usuario Demo",
    email: "usuario@test.com",
    password: "123456",
    rol: "USUARIO",
    createdAt: "2026-05-02T09:00:00-03:00"
  },
  {
    id: 3,
    nombre: "Tecnico Demo",
    email: "tecnico@test.com",
    password: "123456",
    rol: "TECNICO",
    createdAt: "2026-05-03T09:00:00-03:00"
  }
];
