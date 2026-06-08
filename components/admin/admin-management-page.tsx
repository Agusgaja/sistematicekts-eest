"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  Filter,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Tag
} from "lucide-react";

import { useAdminTickets } from "@/components/admin/use-admin-tickets";
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
import { formatDate, shortText } from "@/lib/utils";
import { sortTicketsByPriority } from "@/lib/tickets";
import {
  TICKET_AREAS,
  TICKET_CATEGORIES,
  TICKET_STATUSES,
  type TicketArea,
  type TicketCategory,
  type TicketStatus
} from "@/types/ticket";

type AreaFilter = "TODAS" | TicketArea;
type CategoryFilter = "TODAS" | TicketCategory;
type StatusFilter = "TODOS" | TicketStatus;

export function AdminManagementPage() {
  const {
    user,
    tickets,
    technicians,
    selectedTicket,
    setSelectedTicket,
    handleStatusChange,
    handleAddNote,
    handleAssignmentChange
  } = useAdminTickets();
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("TODAS");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("TODAS");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");

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
          ticket.status
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesArea = areaFilter === "TODAS" || ticket.area === areaFilter;
      const matchesCategory =
        categoryFilter === "TODAS" || ticket.category === categoryFilter;
      const matchesStatus =
        statusFilter === "TODOS" || ticket.status === statusFilter;

      return matchesQuery && matchesArea && matchesCategory && matchesStatus;
    });
  }, [areaFilter, categoryFilter, query, statusFilter, tickets]);

  const sortedTickets = useMemo(
    () => sortTicketsByPriority(filteredTickets),
    [filteredTickets]
  );

  function resetFilters() {
    setQuery("");
    setAreaFilter("TODAS");
    setCategoryFilter("TODAS");
    setStatusFilter("TODOS");
  }

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
      description="Buscá tickets, filtrá por criterios y actualizá estados desde una tabla."
      mode="admin"
      title="Gestión admin"
      user={user}
    >
      <div className="space-y-5">
        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px_240px_190px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por ID, usuario, área, categoría, técnico o descripción"
                value={query}
              />
            </div>

            <Select
              onValueChange={(value) => setAreaFilter(value as AreaFilter)}
              value={areaFilter}
            >
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas las áreas</SelectItem>
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
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas las categorías</SelectItem>
                {TICKET_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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

            <Button type="button" variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </section>

        <section className="rounded-lg border bg-card shadow-sm">
          <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Todos los tickets</h2>
              <p className="text-sm text-muted-foreground">
                {filteredTickets.length} resultados de {tickets.length} tickets.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TICKET_STATUSES.map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-clean">
            <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
              <thead className="bg-muted/45 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Área</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 font-semibold">Prioridad</th>
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Técnico</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedTickets.map((ticket) => (
                  <tr
                    className="border-t transition-colors hover:bg-muted/30"
                    key={ticket.id}
                  >
                    <td className="px-4 py-3 font-semibold">#{ticket.id}</td>
                    <td className="px-4 py-3">{ticket.userName}</td>
                    <td className="px-4 py-3">{ticket.area}</td>
                    <td className="px-4 py-3">
                      <span className="line-clamp-2 max-w-[210px]">{ticket.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-2 max-w-[260px]">
                        {shortText(ticket.description, 96)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ticket.assignedTechnicianName ?? "Sin asignar"}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        onValueChange={(value) =>
                          handleStatusChange(ticket.id, value as TicketStatus)
                        }
                        value={ticket.status}
                      >
                        <SelectTrigger className="h-9 w-[155px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TICKET_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => setSelectedTicket(ticket)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4" />
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
              <p className="font-medium">No hay tickets con esos filtros</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajustá la búsqueda o limpiá los filtros para volver a ver todos.
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <TicketDetailSheet
        technicians={technicians}
        onAddNote={handleAddNote}
        onSaveAssignment={handleAssignmentChange}
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
