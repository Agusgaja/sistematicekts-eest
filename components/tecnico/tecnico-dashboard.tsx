"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  ClipboardList,
  Search,
  ShieldCheck,
  TicketCheck
} from "lucide-react";

import { useTechnicianTickets } from "@/components/tecnico/use-technician-tickets";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { TicketCard } from "@/components/tickets/ticket-card";
import { TicketDetailSheet } from "@/components/tickets/ticket-detail-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/tickets/status-badge";
import { formatDate } from "@/lib/utils";
import { TICKET_STATUSES, type TicketStatus } from "@/types/ticket";

type StatusFilter = "TODOS" | TicketStatus;

export function TecnicoDashboard() {
  const {
    user,
    tickets,
    selectedTicket,
    setSelectedTicket,
    handleStatusChange,
    handleAddObservation
  } = useTechnicianTickets();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          ticket.id.toString(),
          ticket.userName,
          ticket.area,
          ticket.category,
          ticket.description,
          ticket.status
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "TODOS" || ticket.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, tickets]);

  const stats = useMemo(
    () =>
      TICKET_STATUSES.map((status) => ({
        status,
        count: tickets.filter((ticket) => ticket.status === status).length
      })),
    [tickets]
  );

  const recentHistory = useMemo(() => {
    return [...tickets]
      .flatMap((ticket) =>
        ticket.history.map((event) => ({
          ...event,
          ticketId: ticket.id,
          ticketCategory: ticket.category,
          ticketStatus: ticket.status,
          ticketCreatedAt: ticket.createdAt
        }))
      )
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 10);
  }, [tickets]);

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <AppShell
      actions={
        <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium sm:flex">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Técnico
        </div>
      }
      description="Punto de entrada para el trabajo diario del soporte técnico."
      mode="tecnico"
      title="Dashboard técnico"
      user={user}
    >
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-muted-foreground">
                TICKETS ASIGNADOS
              </p>
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{tickets.length}</p>
          </div>

          {stats.map((item) => (
            <div className="rounded-lg border bg-card p-4 shadow-sm" key={item.status}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  {item.status}
                </p>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-2 text-2xl font-semibold">{item.count}</p>
            </div>
          ))}
        </section>

        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por ID, usuario, área o categoría"
                value={query}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setStatusFilter("TODOS")}
            >
              Limpiar filtro
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={statusFilter === "TODOS" ? "default" : "outline"}
              onClick={() => setStatusFilter("TODOS")}
            >
              Todos
            </Button>
            {TICKET_STATUSES.map((status) => (
              <Button
                key={status}
                type="button"
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </section>

        <section id="asignados" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Mis tickets asignados</h2>
              <p className="text-sm text-muted-foreground">
                Solo ves los tickets que fueron asignados a tu cuenta.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredTickets.length} resultados
            </p>
          </div>

          {filteredTickets.length > 0 ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  onClick={setSelectedTicket}
                  showTechnician
                  showUser
                  ticket={ticket}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
              <TicketCheck className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">Sin tickets asignados todavía</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando un administrador te asigne un ticket, aparecerá aquí.
              </p>
            </div>
          )}
        </section>

        <section id="historial" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Historial</h2>
            <p className="text-sm text-muted-foreground">
              Línea de tiempo con la actividad reciente de tus tickets.
            </p>
          </div>

          {recentHistory.length > 0 ? (
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="space-y-0 px-4 py-3">
                {recentHistory.map((event, index) => (
                  <div className="relative flex gap-3 pb-5" key={event.id}>
                    {index < recentHistory.length - 1 ? (
                      <span className="absolute left-[7px] top-5 h-full w-px bg-border" />
                    ) : null}
                    <span className="mt-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{event.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(event.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Ticket #{event.ticketId} · {event.ticketCategory}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {event.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Por {event.authorName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
              <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">Todavía no hay actividad reciente</p>
            </div>
          )}
        </section>
      </div>

      <TicketDetailSheet
        allowInternalComments={false}
        onAddNote={(ticketId, text) => handleAddObservation(ticketId, text)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicket(null);
          }
        }}
        onStatusChange={handleStatusChange}
        open={Boolean(selectedTicket)}
        ticket={selectedTicket}
      />
    </AppShell>
  );
}
