"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  TableProperties,
  Users
} from "lucide-react";

import { useAdminTickets } from "@/components/admin/use-admin-tickets";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { StatusBadge } from "@/components/tickets/status-badge";
import { TicketCard } from "@/components/tickets/ticket-card";
import { TICKET_STATUSES } from "@/types/ticket";

export function AdminDashboard() {
  const { user, tickets } = useAdminTickets();

  const metrics = useMemo(() => {
    return TICKET_STATUSES.map((status) => ({
      status,
      count: tickets.filter((ticket) => ticket.status === status).length
    }));
  }, [tickets]);

  const latestTickets = tickets.slice(0, 4);
  const openTickets = tickets.filter((ticket) => ticket.status !== "RESUELTO").length;

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
      description="Resumen general y accesos rápidos para operar tickets."
      mode="admin"
      title="Dashboard administrativo"
      user={user}
    >
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-muted-foreground">TOTAL</p>
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{tickets.length}</p>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-muted-foreground">PENDIENTES</p>
              <Clock3 className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{openTickets}</p>
          </div>

          {metrics.slice(1).map((metric) => (
            <div className="rounded-lg border bg-card p-4 shadow-sm" key={metric.status}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  {metric.status}
                </p>
                <StatusBadge status={metric.status} />
              </div>
              <p className="mt-2 text-2xl font-semibold">{metric.count}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Link
            className="group rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            href="/admin/kanban"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">Kanban</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Vista por columnas para seguir el flujo Abierto, En proceso y Resuelto.
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
                  Alta, búsqueda y cambio de roles para usuarios del sistema.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>

          <Link
            className="group rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            href="/admin/gestion"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TableProperties className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">Gestión admin</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Tabla operativa para buscar, filtrar y cambiar estados.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>
        </section>

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
              href="/admin/gestion"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {latestTickets.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {latestTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  showTechnician
                  showUser
                  ticket={ticket}
                />
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
