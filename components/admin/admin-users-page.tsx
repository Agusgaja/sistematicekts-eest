"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, Users } from "lucide-react";

import { useAdminUsers } from "@/components/admin/use-admin-users";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { USER_ROLES, type UserRole } from "@/types/user";

export function AdminUsersPage() {
  const { user: currentUser, users, handleRoleChange } = useAdminUsers();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((item) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        item.nombre.toLowerCase().includes(normalizedQuery) ||
        item.email.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, users]);

  const adminCount = useMemo(
    () => users.filter((item) => item.rol === "ADMIN").length,
    [users]
  );

  if (!currentUser) {
    return <LoadingScreen />;
  }

  function onChangeRole(userId: number, nextRole: UserRole) {
    setMessage("");
    setError("");

    try {
      handleRoleChange(userId, nextRole);
      setMessage("Rol actualizado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el rol.");
    }
  }

  return (
    <AppShell
      actions={
        <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium sm:flex">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Admin
        </div>
      }
      description="Buscá usuarios y administrá sus roles desde una sola pantalla."
      mode="admin"
      title="Gestión de Usuarios"
      user={currentUser}
    >
      <div className="space-y-5">
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">TOTAL</p>
            <p className="mt-2 text-2xl font-semibold">{users.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">ADMIN</p>
            <p className="mt-2 text-2xl font-semibold">{adminCount}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">
              USUARIOS FILTRADOS
            </p>
            <p className="mt-2 text-2xl font-semibold">{filteredUsers.length}</p>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre o correo electrónico"
              value={query}
            />
          </div>

          {message ? (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border bg-card shadow-sm">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Usuarios del sistema</h2>
            <p className="text-sm text-muted-foreground">
              Los cambios se guardan de inmediato en el almacenamiento local del navegador.
            </p>
          </div>

          <div className="overflow-x-auto scrollbar-clean">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead className="bg-muted/45 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Correo electrónico</th>
                  <th className="px-4 py-3 font-semibold">Rol actual</th>
                  <th className="px-4 py-3 font-semibold">Fecha de registro</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => {
                  const isCurrentAdmin =
                    item.id === currentUser.id && item.rol === "ADMIN";
                  const selfLock = isCurrentAdmin && adminCount === 1;

                  return (
                    <tr className="border-t transition-colors hover:bg-muted/30" key={item.id}>
                      <td className="px-4 py-3 font-medium">{item.nombre}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md border bg-background px-2.5 py-1 text-xs font-semibold">
                          {item.rol}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Select
                            disabled={selfLock}
                            onValueChange={(value) =>
                              onChangeRole(item.id, value as UserRole)
                            }
                            value={item.rol}
                          >
                            <SelectTrigger className="h-9 w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {USER_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selfLock ? (
                            <span className="text-xs text-muted-foreground">
                              Único admin
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="border-t p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No hay usuarios con esa búsqueda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Probá con otro nombre o correo.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
