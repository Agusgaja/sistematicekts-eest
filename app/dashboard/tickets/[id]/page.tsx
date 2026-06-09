"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  MapPin,
  MessageSquareCode,
  UserRound,
  Users
} from "lucide-react";

import { useSessionGuard } from "@/components/auth/use-session-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import { StatusBadge } from "@/components/tickets/status-badge";
import { TicketTimeline } from "@/components/tickets/ticket-timeline";
import { TicketDetailSkeleton } from "@/components/tickets/ticket-detail-skeleton";
import { Button } from "@/components/ui/button";
import { getTickets } from "@/lib/tickets";
import { formatDate, formatDuration } from "@/lib/utils";
import type { Ticket } from "@/types/ticket";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function UsuarioTicketDetail({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const ticketId = Number(id);

  const { user } = useSessionGuard(["USUARIO"]);
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!user) return;
    const allTickets = getTickets();
    // Normal users can only see their own tickets
    const found = allTickets.find((t) => t.id === ticketId && t.userId === user.id);
    if (found) {
      setTicket(found);
    } else {
      // If not found or belongs to another user, redirect back
      router.push("/dashboard");
    }
  }, [user, ticketId, router]);

  if (!user) {
    return <LoadingScreen />;
  }

  if (!ticket) {
    return (
      <AppShell
        description="Recuperando estado de tu solicitud..."
        mode="user"
        title="Cargando Ticket..."
        user={user}
      >
        <TicketDetailSkeleton backPath="/dashboard" backLabel="Volver a Mis Tickets" />
      </AppShell>
    );
  }

  const technicalObservations = ticket.notes.filter((note) => note.type === "OBSERVACION");

  return (
    <AppShell
      actions={
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Mis Tickets
        </Button>
      }
      description={`Visualización del estado y progreso de tu solicitud #${ticket.id}`}
      mode="user"
      title={`Ticket #${ticket.id}`}
      user={user}
    >
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Columna Izquierda: Ficha del Ticket */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border bg-card/60 p-5 shadow-sm space-y-5 backdrop-blur animate-card-enter">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Tu Solicitud</span>
              <div className="flex gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5 rounded-lg border bg-background/40 p-2.5">
                <UserRound className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-semibold">Usuario</p>
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
              <span className="text-xs text-muted-foreground font-semibold">Descripción de tu problema</span>
              <p className="text-sm leading-relaxed text-muted-foreground font-medium whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                <CalendarDays className="h-4 w-4" />
                <span>Fechas de Seguimiento</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-muted-foreground/70">Creado el:</p>
                  <p className="font-semibold text-foreground/85 mt-0.5">{formatDate(ticket.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground/70">Resuelto el:</p>
                  <p className="font-semibold text-foreground/85 mt-0.5">
                    {ticket.fechaResolucion ? formatDate(ticket.fechaResolucion) : "En cola de soporte"}
                  </p>
                </div>
              </div>
              {ticket.fechaResolucion && (
                <div className="rounded-md bg-emerald-500/10 text-emerald-500 p-2.5 text-xs text-center font-bold">
                  Resuelto en: {formatDuration(ticket.createdAt, ticket.fechaResolucion)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Observaciones Técnicas (Lectura) y Timeline */}
        <div className="space-y-6 lg:col-span-7">
          {/* Observaciones Técnicas (Modo Lectura) */}
          <div className="rounded-xl border bg-card/60 p-5 shadow-sm space-y-4 backdrop-blur animate-card-enter delay-100">
            <h3 className="text-sm font-bold tracking-wide uppercase text-muted-foreground border-b pb-2 flex items-center gap-1.5">
              <MessageSquareCode className="h-4 w-4" />
              Observaciones del Equipo Técnico
            </h3>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-clean">
              {technicalObservations.map((obs) => (
                <div key={obs.id} className="rounded-lg border bg-background/50 p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground/85">Soporte Técnico</span>
                    <span className="text-muted-foreground">{formatDate(obs.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground font-medium">{obs.text}</p>
                </div>
              ))}
              {technicalObservations.length === 0 && (
                <p className="text-center py-8 text-xs text-muted-foreground italic">
                  Aún no se han registrado observaciones técnicas para tu solicitud.
                </p>
              )}
            </div>
          </div>

          {/* Timeline Visual del Historial */}
          <div className="rounded-xl border bg-card/60 p-5 shadow-sm space-y-5 backdrop-blur animate-card-enter delay-180">
            <h3 className="text-sm font-bold tracking-wide uppercase text-muted-foreground border-b pb-2">
              Historial del Ticket
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
