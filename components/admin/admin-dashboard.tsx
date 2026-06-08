"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Archive,
  ArrowRight,
  ClipboardList,
  Flame,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  TableProperties,
  UserX,
  Users
} from "lucide-react";

import { useAdminTickets } from "@/components/admin/use-admin-tickets";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { TicketCard } from "@/components/tickets/ticket-card";
import { getArchivedTickets } from "@/lib/tickets";

export function AdminDashboard() {
  const { user, tickets } = useAdminTickets();

  const metrics = useMemo(() => {
    const activeTickets = tickets; // active non-archived tickets
    const archivedCount = getArchivedTickets().length;

    return {
      total: activeTickets.length,
      unassigned: activeTickets.filter((t) => !t.assignedTechnicianId).length,
      highPriority: activeTickets.filter((t) => t.priority === "ALTA").length,
      inProcess: activeTickets.filter((t) => t.status === "EN PROCESO").length,
      resolved: activeTickets.filter((t) => t.status === "RESUELTO").length,
      archived: archivedCount
    };
  }, [tickets]);

  const latestTickets = tickets.slice(0, 4);

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <AppShell
      actions={
        <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium sm:flex">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Admin
        </div>
      }
      description="Resumen operativo del estado del soporte y accesos rápidos."
      mode="admin"
      title="Dashboard administrativo"
      user={user}
    >
      <div className="space-y-6">
        {/* Métricas con diseño premium de 6 tarjetas */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-lg border bg-card p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center justify-between gap-3 text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Total Activos</span>
              <LayoutDashboard className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">{metrics.total}</p>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center justify-between gap-3 text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Sin Asignar</span>
              <UserX className="h-4 w-4 text-slate-500" />
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-400">{metrics.unassigned}</p>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center justify-between gap-3 text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Alta Prioridad</span>
              <Flame className="h-4 w-4 text-red-500 fill-red-500/10" />
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-red-500">{metrics.highPriority}</p>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center justify-between gap-3 text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">En Proceso</span>
              <RefreshCw className="h-4 w-4 text-amber-500 animate-spin-slow" />
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-amber-500">{metrics.inProcess}</p>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center justify-between gap-3 text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Resueltos</span>
              <ClipboardList className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-500">{metrics.resolved}</p>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center justify-between gap-3 text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Archivados</span>
              <Archive className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-purple-500">{metrics.archived}</p>
          </div>
        </section>

        {/* Accesos rápidos actualizados */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Link
            className="group rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            href="/admin/tickets"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">Tickets (Vista Kanban)</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Hacé seguimiento del flujo de trabajo por columnas interactivas usando arrastrar y soltar.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>

          <Link
            className="group rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            href="/admin/users"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">Gestión de Usuarios</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Alta de usuarios, búsqueda y asignación de roles del sistema.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>

          <Link
            className="group rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            href="/admin/tickets"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TableProperties className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">Tickets (Vista Tabla)</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Operá tus tickets activos en una tabla con búsqueda rápida, ordenamiento y filtros avanzados.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>
        </section>

        {/* Tickets Recientes */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Tickets recientes</h2>
              <p className="text-sm text-muted-foreground">
                Últimas solicitudes actualizadas en el sistema.
              </p>
            </div>
            <Link
              className="hidden items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
              href="/admin/tickets"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {latestTickets.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {latestTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="text-left cursor-pointer transition-transform duration-150 active:scale-[0.985]"
                >
                  <TicketCard
                    onClick={() => {}} // Non-interactive inside list or can navigate to detail
                    showTechnician
                    showUser
                    ticket={ticket}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
              <p className="font-medium">Todavía no hay tickets</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando los usuarios creen solicitudes, aparecerán acá.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
