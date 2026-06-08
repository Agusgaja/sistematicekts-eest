"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  MapPin,
  MessageSquareCode,
  ShieldCheck,
  UserRound,
  Users
} from "lucide-react";

import { useSessionGuard } from "@/components/auth/use-session-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import { StatusBadge } from "@/components/tickets/status-badge";
import { TicketTimeline } from "@/components/tickets/ticket-timeline";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  addTicketNote,
  getTickets,
  updateTicketStatus
} from "@/lib/tickets";
import { formatDate, formatDuration } from "@/lib/utils";
import type { Ticket, TicketStatus } from "@/types/ticket";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function TecnicoTicketDetail({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const ticketId = Number(id);

  const { user } = useSessionGuard(["TECNICO"]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newObservation, setNewObservation] = useState("");

  useEffect(() => {
    if (!user) return;
    const allTickets = getTickets();
    const found = allTickets.find((t) => t.id === ticketId);
    if (found) {
      setTicket(found);
    }
  }, [user, ticketId]);

  function reloadTicket() {
    const found = getTickets().find((t) => t.id === ticketId);
    if (found) {
      setTicket(found);
    }
  }

  function handleStatusChange(status: TicketStatus) {
    if (!user || !ticket) return;
    updateTicketStatus(ticket.id, status, user.nombre);
    reloadTicket();
  }

  function handleAddObservation() {
    if (!user || !ticket || !newObservation.trim()) return;
    addTicketNote(ticket.id, newObservation, "OBSERVACION", user.nombre);
    setNewObservation("");
    reloadTicket();
  }

  if (!user || !ticket) {
    return <LoadingScreen />;
  }

  // Double check if this technician is allowed to view/edit this ticket
  // Normally technicians are allowed to view any assigned ticket, or if there's no assignment constraint, view all.
  // We respect the existing behavior.

  const technicalObservations = ticket.notes.filter((note) => note.type === "OBSERVACION");

  return (
    <AppShell
      actions={
        <Button
          onClick={() => router.push("/tecnico")}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Inicio
        </Button>
      }
      description={`Gestión técnica y reporte sobre el ticket #${ticket.id}`}
      mode="tecnico"
      title={`Ticket #${ticket.id}`}
      user={user}
    >
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Columna Izquierda: Información General y Cambios de Estado */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border bg-card/60 p-5 shadow-sm space-y-5 backdrop-blur">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Ficha</span>
              <div className="flex gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5 rounded-lg border bg-background/40 p-2.5">
                <UserRound className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-semibold">Creador</p>
                  <p className="font-bold truncate mt-0.5">{ticket.userName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border bg-background/40 p-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-semibold">Área</p>
                  <p className="font-bold truncate mt-0.5">{ticket.area}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-background/45 p-3 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Categoría</span>
              <p className="font-bold text-foreground/90">{ticket.category}</p>
            </div>

            <div className="rounded-lg border bg-background/45 p-3 space-y-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Descripción original</span>
              <p className="text-sm leading-relaxed text-muted-foreground font-medium whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                <CalendarDays className="h-4 w-4" />
                <span>Fechas</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-muted-foreground/70">Creado:</p>
                  <p className="font-semibold text-foreground/85 mt-0.5">{formatDate(ticket.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground/70">Resuelto:</p>
                  <p className="font-semibold text-foreground/85 mt-0.5">
                    {ticket.fechaResolucion ? formatDate(ticket.fechaResolucion) : "Pendiente"}
                  </p>
                </div>
              </div>
              {ticket.fechaResolucion && (
                <div className="rounded-md bg-emerald-500/10 text-emerald-500 p-2.5 text-xs text-center font-bold">
                  Tiempo total: {formatDuration(ticket.createdAt, ticket.fechaResolucion)}
                </div>
              )}
            </div>
          </div>

          {/* Actualizar Estado */}
          <div className="rounded-xl border bg-card/60 p-5 shadow-sm space-y-4 backdrop-blur">
            <h3 className="text-sm font-bold tracking-wide uppercase text-muted-foreground border-b pb-2">Estado del Reporte</h3>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold">Actualizar Estado</Label>
              <Select onValueChange={handleStatusChange} value={ticket.status}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABIERTO">ABIERTO</SelectItem>
                  <SelectItem value="EN PROCESO">EN PROCESO</SelectItem>
                  <SelectItem value="RESUELTO">RESUELTO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Tus cambios de estado registrarán un evento automático en la auditoría del ticket.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Observaciones Técnicas y Timeline Visual */}
        <div className="space-y-6 lg:col-span-7">
          {/* Observaciones Técnicas */}
          <div className="rounded-xl border bg-card/60 p-5 shadow-sm space-y-4 backdrop-blur">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
                <MessageSquareCode className="h-4 w-4" />
                Bitácora de Observaciones Técnicas
              </h3>
              <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold">
                {technicalObservations.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1 scrollbar-clean">
              {technicalObservations.map((obs) => (
                <div key={obs.id} className="rounded-lg border bg-background/50 p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground/80">{obs.authorName}</span>
                    <span className="text-muted-foreground">{formatDate(obs.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground font-medium">{obs.text}</p>
                </div>
              ))}
              {technicalObservations.length === 0 && (
                <p className="text-center py-6 text-xs text-muted-foreground italic">
                  No se han registrado observaciones técnicas aún.
                </p>
              )}
            </div>

            <div className="space-y-2 border-t pt-3">
              <Label htmlFor="observation-input" className="text-xs font-bold">Registrar Trabajo Técnico</Label>
              <Textarea
                id="observation-input"
                placeholder="Ingresá los detalles del trabajo realizado, piezas cambiadas o incidencias encontradas..."
                value={newObservation}
                onChange={(e) => setNewObservation(e.target.value)}
                className="bg-background/50 text-sm focus:bg-background"
                rows={3}
              />
              <Button onClick={handleAddObservation} className="w-full sm:w-auto" size="sm">
                Añadir Observación
              </Button>
            </div>
          </div>

          {/* Timeline Visual del Historial */}
          <div className="rounded-xl border bg-card/60 p-5 shadow-sm space-y-5 backdrop-blur">
            <h3 className="text-sm font-bold tracking-wide uppercase text-muted-foreground border-b pb-2">
              Auditoría y Progreso
            </h3>
            <div className="px-1.5">
              <TicketTimeline history={ticket.history} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
