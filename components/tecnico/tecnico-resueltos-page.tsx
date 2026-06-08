"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, SlidersHorizontal, CheckCircle2 } from "lucide-react";

import { useSessionGuard } from "@/components/auth/use-session-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { TicketDetailSheet } from "@/components/tickets/ticket-detail-sheet";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { getActiveTickets, sortTicketsByPriority } from "@/lib/tickets";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type Ticket,
  type TicketCategory,
  type TicketPriority
} from "@/types/ticket";

type CategoryFilter = "TODAS" | TicketCategory;
type PriorityFilter = "TODAS" | TicketPriority;

export function TecnicoResueltosPage() {
  const { user } = useSessionGuard(["TECNICO"]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("TODAS");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("TODAS");

  useEffect(() => {
    if (!user) {
      return;
    }

    setTickets(
      sortTicketsByPriority(
        getActiveTickets().filter(
          (ticket) =>
            ticket.assignedTechnicianId === user.id && ticket.status === "RESUELTO"
        )
      )
    );
  }, [user]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesQuery =
        !normalizedQuery ||
        [ticket.id.toString(), ticket.userName, ticket.area, ticket.category, ticket.priority]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        categoryFilter === "TODAS" || ticket.category === categoryFilter;
      const matchesPriority =
        priorityFilter === "TODAS" || ticket.priority === priorityFilter;

      return matchesQuery && matchesCategory && matchesPriority;
    });
  }, [categoryFilter, priorityFilter, query, tickets]);

  const totalResolvedTime = useMemo(() => {
    return filteredTickets.reduce((accumulator, ticket) => {
      if (!ticket.fechaResolucion) {
        return accumulator;
      }

      return accumulator + (Date.parse(ticket.fechaResolucion) - Date.parse(ticket.createdAt));
    }, 0);
  }, [filteredTickets]);

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <AppShell
      actions={
        <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium sm:flex">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Tecnico
        </div>
      }
      description="Historial de tickets resueltos asignados a tu cuenta."
      mode="tecnico"
      title="Mis resueltos"
      user={user}
    >
      <div className="space-y-5">
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">TOTAL</p>
            <p className="mt-2 text-2xl font-semibold">{tickets.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">FILTRADOS</p>
            <p className="mt-2 text-2xl font-semibold">{filteredTickets.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">TIEMPO TOTAL</p>
            <p className="mt-2 text-2xl font-semibold">
              {totalResolvedTime > 0 ? `${Math.round(totalResolvedTime / 3600000)}h` : "-"}
            </p>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por ID, usuario, area o categoria"
                value={query}
              />
            </div>

            <Select
              onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
              value={categoryFilter}
            >
              <SelectTrigger>
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas las categorias</SelectItem>
                {TICKET_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}
              value={priorityFilter}
            >
              <SelectTrigger>
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas las prioridades</SelectItem>
                {TICKET_PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategoryFilter("TODAS");
                setPriorityFilter("TODAS");
              }}
            >
              Limpiar
            </Button>
          </div>
        </section>

        <section className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto scrollbar-clean">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead className="bg-muted/45 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Prioridad</th>
                  <th className="px-4 py-3 font-semibold">Creacion</th>
                  <th className="px-4 py-3 font-semibold">Resolucion</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr className="border-t transition-colors hover:bg-muted/30" key={ticket.id}>
                    <td className="px-4 py-3 font-semibold">#{ticket.id}</td>
                    <td className="px-4 py-3">{ticket.userName}</td>
                    <td className="px-4 py-3">{ticket.area}</td>
                    <td className="px-4 py-3">
                      <span className="line-clamp-2 max-w-[220px]">{ticket.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ticket.fechaResolucion ? formatDate(ticket.fechaResolucion) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => setSelectedTicket(ticket)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="border-t p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No hay tickets resueltos con esos filtros</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajusta la busqueda o cambia los filtros.
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <TicketDetailSheet
        allowInternalComments={false}
        onAddNote={() => {}}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicket(null);
          }
        }}
        onStatusChange={() => {}}
        open={Boolean(selectedTicket)}
        readOnly
        ticket={selectedTicket}
      />
    </AppShell>
  );
}
