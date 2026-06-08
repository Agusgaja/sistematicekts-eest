"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, Filter, Search, ShieldCheck, SlidersHorizontal, Tag } from "lucide-react";

import { useSessionGuard } from "@/components/auth/use-session-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { StatusBadge } from "@/components/tickets/status-badge";
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
import { getArchivedTickets, sortTicketsByPriority } from "@/lib/tickets";
import {
  TICKET_AREAS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type Ticket,
  type TicketArea,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus
} from "@/types/ticket";

type AreaFilter = "TODAS" | TicketArea;
type CategoryFilter = "TODAS" | TicketCategory;
type PriorityFilter = "TODAS" | TicketPriority;
type StatusFilter = "TODOS" | TicketStatus;

export function AdminRegistroPage() {
  const { user } = useSessionGuard(["ADMIN"]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("TODAS");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("TODAS");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("TODAS");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");

  useEffect(() => {
    if (!user) {
      return;
    }

    setTickets(getArchivedTickets());
  }, [user]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          ticket.id.toString(),
          ticket.userName,
          ticket.assignedTechnicianName ?? "",
          ticket.area,
          ticket.category,
          ticket.description,
          ticket.status,
          ticket.priority
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesArea = areaFilter === "TODAS" || ticket.area === areaFilter;
      const matchesCategory =
        categoryFilter === "TODAS" || ticket.category === categoryFilter;
      const matchesPriority =
        priorityFilter === "TODAS" || ticket.priority === priorityFilter;
      const matchesStatus =
        statusFilter === "TODOS" || ticket.status === statusFilter;

      return matchesQuery && matchesArea && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [areaFilter, categoryFilter, priorityFilter, query, statusFilter, tickets]);

  const sortedTickets = useMemo(
    () => sortTicketsByPriority(filteredTickets),
    [filteredTickets]
  );

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
      description="Archivo historico de tickets resueltos y cerrados automaticamente."
      mode="admin"
      title="Registro"
      user={user}
    >
      <div className="space-y-5">
        <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">TOTAL</p>
            <p className="mt-2 text-2xl font-semibold">{tickets.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">FILTRADOS</p>
            <p className="mt-2 text-2xl font-semibold">{sortedTickets.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">RESUELTOS</p>
            <p className="mt-2 text-2xl font-semibold">
              {tickets.filter((ticket) => ticket.status === "RESUELTO").length}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">ARCHIVO</p>
            <p className="mt-2 text-2xl font-semibold">
              {tickets.filter((ticket) => ticket.archivedAt).length}
            </p>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_220px_180px_180px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por ID, usuario, tecnico, area, categoria o prioridad"
                value={query}
              />
            </div>

            <Select
              onValueChange={(value) => setAreaFilter(value as AreaFilter)}
              value={areaFilter}
            >
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas las areas</SelectItem>
                {TICKET_AREAS.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
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

            <Select
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              value={statusFilter}
            >
              <SelectTrigger>
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                {TICKET_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("");
                setAreaFilter("TODAS");
                setCategoryFilter("TODAS");
                setPriorityFilter("TODAS");
                setStatusFilter("TODOS");
              }}
            >
              Limpiar
            </Button>
          </div>
        </section>

        <section className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto scrollbar-clean">
            <table className="w-full min-w-[1240px] border-collapse text-left text-sm">
              <thead className="bg-muted/45 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Tecnico</th>
                  <th className="px-4 py-3 font-semibold">Prioridad</th>
                  <th className="px-4 py-3 font-semibold">Creacion</th>
                  <th className="px-4 py-3 font-semibold">Resolucion</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedTickets.map((ticket) => (
                  <tr className="border-t transition-colors hover:bg-muted/30" key={ticket.id}>
                    <td className="px-4 py-3 font-semibold">#{ticket.id}</td>
                    <td className="px-4 py-3">{ticket.userName}</td>
                    <td className="px-4 py-3">{ticket.area}</td>
                    <td className="px-4 py-3">
                      <span className="line-clamp-2 max-w-[220px]">{ticket.category}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ticket.assignedTechnicianName ?? "Sin asignar"}
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
                      <StatusBadge status={ticket.status} />
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

          {sortedTickets.length === 0 ? (
            <div className="border-t p-8 text-center">
              <Archive className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No hay tickets con esos filtros</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajusta la busqueda o limpia los filtros para volver a ver el archivo.
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <TicketDetailSheet
        allowInternalComments
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
