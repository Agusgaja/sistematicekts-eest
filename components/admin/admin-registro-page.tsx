"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, BookOpen, Eye, Filter, Library, Search, ShieldCheck, SlidersHorizontal, Tag } from "lucide-react";

import { useSessionGuard } from "@/components/auth/use-session-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { StatusBadge } from "@/components/tickets/status-badge";
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
  const router = useRouter();
  const { user } = useSessionGuard(["ADMIN"]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
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
        <div className="hidden items-center gap-2 rounded-md border bg-slate-900/60 dark:bg-slate-950/65 px-3 py-2 text-sm font-semibold sm:flex text-amber-500/90 border-amber-500/20">
          <Library className="h-4 w-4" />
          Archivo Histórico
        </div>
      }
      description="Historial archivado de tickets resueltos o cerrados. Acceso a solo lectura."
      mode="admin"
      title="Registro y Archivo"
      user={user}
    >
      <div className="space-y-6">
        {/* Cabecera Especializada de Estilo Archivo Histórico / Institucional */}
        <section className="relative overflow-hidden rounded-xl border border-slate-700/40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-700/50 text-amber-400 border border-slate-600/50 shadow-inner">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight font-serif text-slate-100">Repositorio Histórico de Incidencias</h2>
                <p className="mt-1.5 text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Historial de registros y auditoría técnica. Los tickets resueltos son transferidos automáticamente a este archivo inmutable transcurridos los 7 días de inactividad para optimizar el rendimiento operativo del panel activo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:flex md:items-center gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-750 pt-4 md:pt-0">
              <div className="text-center md:px-4 md:border-r border-slate-700">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Archivados</p>
                <p className="mt-1 text-2xl font-bold font-mono text-amber-400">{tickets.length}</p>
              </div>
              <div className="text-center md:px-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtrados</p>
                <p className="mt-1 text-2xl font-bold font-mono text-slate-200">{sortedTickets.length}</p>
              </div>
            </div>
          </div>
          {/* Sutil marca de agua visual del escudo */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-y-6 translate-x-6">
            <Library className="h-64 w-64 text-slate-100" />
          </div>
        </section>

        {/* Filtros de Búsqueda */}
        <section className="rounded-lg border bg-card/40 p-4 shadow-sm backdrop-blur">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_220px_180px_180px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 bg-background/50 focus:bg-background"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por ID, creador, técnico, descripción..."
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
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
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
              onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}
              value={priorityFilter}
            >
              <SelectTrigger className="bg-background/50">
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

        {/* Tabla Operativa de Históricos */}
        <section className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-clean">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-slate-900/10 dark:bg-slate-950/20 text-xs uppercase text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3 font-bold w-[90px]">ID</th>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Área</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 font-semibold">Técnico</th>
                  <th className="px-4 py-3 font-semibold">Prioridad</th>
                  <th className="px-4 py-3 font-semibold">Creación</th>
                  <th className="px-4 py-3 font-semibold">Resolución</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold text-right w-[100px]">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedTickets.map((ticket) => (
                  <tr
                    className="transition-colors hover:bg-muted/10 cursor-pointer"
                    key={ticket.id}
                    onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                  >
                    <td className="px-4 py-3.5 font-bold text-muted-foreground">#{ticket.id}</td>
                    <td className="px-4 py-3.5 font-medium">{ticket.userName}</td>
                    <td className="px-4 py-3.5">{ticket.area}</td>
                    <td className="px-4 py-3.5">
                      <span className="line-clamp-1 max-w-[200px] text-foreground/80">{ticket.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs font-mono">
                      {ticket.assignedTechnicianName ?? "Sin asignar"}
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {ticket.fechaResolucion ? formatDate(ticket.fechaResolucion) : "-"}
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
                        className="h-8 gap-1 hover:bg-muted/80 text-xs text-amber-500/80 hover:text-amber-500"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedTickets.length === 0 ? (
            <div className="p-12 text-center border-t bg-muted/10">
              <Archive className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 font-semibold text-muted-foreground">El archivo está vacío o sin coincidencias</p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Ajustá la búsqueda o limpiá los filtros del repositorio general.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
