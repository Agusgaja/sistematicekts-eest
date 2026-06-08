"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Eye,
  Filter,
  Kanban,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Table,
  Tag,
  TicketCheck,
  UserRound,
  Users
} from "lucide-react";

import { useAdminTickets } from "@/components/admin/use-admin-tickets";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { StatusBadge } from "@/components/tickets/status-badge";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import { TicketCard } from "@/components/tickets/ticket-card";
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
import { sortTicketsByPriority } from "@/lib/tickets";
import {
  TICKET_AREAS,
  TICKET_CATEGORIES,
  TICKET_STATUSES,
  type TicketArea,
  type TicketCategory,
  type TicketStatus
} from "@/types/ticket";
import { cn } from "@/lib/utils";

type AreaFilter = "TODAS" | TicketArea;
type CategoryFilter = "TODAS" | TicketCategory;
type StatusFilter = "TODOS" | TicketStatus;

export function AdminTicketsPage() {
  const router = useRouter();
  const {
    user,
    tickets,
    handleStatusChange
  } = useAdminTickets();

  const [activeTab, setActiveTab] = useState<"tabla" | "kanban">("tabla");
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("TODAS");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("TODAS");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [draggedTicketId, setDraggedTicketId] = useState<number | null>(null);

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

  function handleDrop(nextStatus: TicketStatus) {
    if (!draggedTicketId) {
      return;
    }
    handleStatusChange(draggedTicketId, nextStatus);
    setDraggedTicketId(null);
  }

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <AppShell
      actions={
        <div className="hidden items-center gap-2 rounded-md border bg-card/40 backdrop-blur px-3 py-2 text-sm font-medium sm:flex">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Administrador
        </div>
      }
      description="Visualizá, gestioná y realizá seguimiento de todos los tickets activos."
      mode="admin"
      title="Tickets"
      user={user}
    >
      <div className="space-y-6">
        {/* Selector de Tabs Moderno */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex space-x-1 rounded-lg bg-muted/40 p-1 border">
            <button
              onClick={() => setActiveTab("tabla")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                activeTab === "tabla"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Table className="h-4 w-4" />
              Tabla
            </button>
            <button
              onClick={() => setActiveTab("kanban")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                activeTab === "kanban"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Kanban className="h-4 w-4" />
              Kanban
            </button>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Mostrando {filteredTickets.length} de {tickets.length} tickets activos
          </p>
        </div>

        {/* Filtros Unificados */}
        <section className="rounded-lg border bg-card/60 p-4 shadow-sm backdrop-blur">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px_240px_190px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 bg-background/50 focus:bg-background"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por ID, creador, área, categoría, técnico o descripción..."
                value={query}
              />
            </div>

            <Select
              onValueChange={(value) => setAreaFilter(value as AreaFilter)}
              value={areaFilter}
            >
              <SelectTrigger className="bg-background/50">
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
              <SelectTrigger className="bg-background/50">
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
              <SelectTrigger className="bg-background/50">
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

        {/* Renderizado de Vistas */}
        {activeTab === "tabla" ? (
          <section className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-clean">
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-[90px]">ID</th>
                    <th className="px-4 py-3 font-semibold">Usuario</th>
                    <th className="px-4 py-3 font-semibold">Área</th>
                    <th className="px-4 py-3 font-semibold">Categoría</th>
                    <th className="px-4 py-3 font-semibold">Prioridad</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Técnico</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold text-right w-[100px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedTickets.map((ticket) => (
                    <tr
                      className="transition-colors hover:bg-muted/20 cursor-pointer"
                      key={ticket.id}
                      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    >
                      <td className="px-4 py-3.5 font-bold text-primary">#{ticket.id}</td>
                      <td className="px-4 py-3.5 font-medium">{ticket.userName}</td>
                      <td className="px-4 py-3.5">{ticket.area}</td>
                      <td className="px-4 py-3.5">
                        <span className="line-clamp-1 max-w-[200px] font-semibold text-foreground/95">{ticket.category}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {ticket.assignedTechnicianName ?? (
                          <span className="text-xs italic text-muted-foreground/70">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                          size="sm"
                          type="button"
                          variant="ghost"
                          className="h-8 gap-1 hover:bg-muted/80 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="p-10 text-center border-t bg-muted/10">
                <p className="font-semibold text-muted-foreground">No hay tickets con esos filtros</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Ajustá la búsqueda o limpiá los filtros para ver todos.
                </p>
              </div>
            ) : null}
          </section>
        ) : (
          <section className="grid gap-4 xl:grid-cols-3">
            {TICKET_STATUSES.map((status) => {
              const columnTickets = sortedTickets.filter(
                (ticket) => ticket.status === status
              );

              return (
                <div
                  className="min-h-[460px] rounded-lg border bg-muted/15 p-4 transition-colors flex flex-col"
                  key={status}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(status)}
                >
                  <div className="mb-4 flex items-center justify-between border-b pb-2">
                    <div>
                      <h2 className="text-sm font-bold tracking-wide text-foreground/90">{status}</h2>
                      <p className="text-xs text-muted-foreground">
                        {columnTickets.length} tickets
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1 scrollbar-clean">
                    {columnTickets.length > 0 ? (
                      columnTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="text-left w-full block transition-transform duration-150 active:scale-[0.98]"
                        >
                          <TicketCard
                            onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                            draggable
                            onDragEnd={() => setDraggedTicketId(null)}
                            onDragStart={(draggedTicket) => setDraggedTicketId(draggedTicket.id)}
                            showUser
                            showTechnician
                            ticket={ticket}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed bg-background/40 p-6 text-center">
                        <div className="opacity-60">
                          <TicketCheck className="mx-auto h-6 w-6 text-muted-foreground" />
                          <p className="mt-2 text-xs font-semibold">Columna vacía</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </AppShell>
  );
}
