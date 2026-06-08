"use client";

import { useMemo, useState } from "react";
import { Filter, Search, ShieldCheck, SlidersHorizontal, TicketCheck } from "lucide-react";

import { useAdminTickets } from "@/components/admin/use-admin-tickets";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { StatusBadge } from "@/components/tickets/status-badge";
import { TicketCard } from "@/components/tickets/ticket-card";
import { TicketDetailSheet } from "@/components/tickets/ticket-detail-sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  TICKET_AREAS,
  TICKET_STATUSES,
  type TicketArea,
  type TicketStatus
} from "@/types/ticket";
import { sortTicketsByPriority } from "@/lib/tickets";

type AreaFilter = "TODAS" | TicketArea;
type StatusFilter = "TODOS" | TicketStatus;

export function AdminKanbanPage() {
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
      const matchesStatus =
        statusFilter === "TODOS" || ticket.status === statusFilter;

      return matchesQuery && matchesArea && matchesStatus;
    });
  }, [areaFilter, query, statusFilter, tickets]);

  const sortedTickets = useMemo(
    () => sortTicketsByPriority(filteredTickets),
    [filteredTickets]
  );

  const metrics = useMemo(() => {
    return TICKET_STATUSES.map((status) => ({
      status,
      count: tickets.filter((ticket) => ticket.status === status).length
    }));
  }, [tickets]);

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
        <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium sm:flex">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Admin
        </div>
      }
      description="Visualizá todos los tickets por estado y atendelos desde el flujo."
      mode="admin"
      title="Kanban de tickets"
      user={user}
    >
      <div className="space-y-5">
        <section className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-sm"
              key={metric.status}
            >
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  {metric.status}
                </p>
                <p className="mt-1 text-2xl font-semibold">{metric.count}</p>
              </div>
              <StatusBadge status={metric.status} />
            </div>
          ))}
        </section>

        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por ID, usuario, área o categoría"
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
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {TICKET_STATUSES.map((status) => {
            const columnTickets = sortedTickets.filter(
              (ticket) => ticket.status === status
            );

            return (
              <div
                className="min-h-[420px] rounded-lg border bg-muted/35 p-3 transition-colors"
                key={status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(status)}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{status}</h2>
                    <p className="text-xs text-muted-foreground">
                      {columnTickets.length} tickets
                    </p>
                  </div>
                  <StatusBadge status={status} />
                </div>

                {columnTickets.length > 0 ? (
                  <div className="space-y-3">
                    {columnTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        onClick={setSelectedTicket}
                        draggable
                        onDragEnd={() => setDraggedTicketId(null)}
                        onDragStart={(draggedTicket) => setDraggedTicketId(draggedTicket.id)}
                        showUser
                        showTechnician
                        ticket={ticket}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed bg-background/60 p-6 text-center">
                    <div>
                      <TicketCheck className="mx-auto h-7 w-7 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">Sin tickets</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
