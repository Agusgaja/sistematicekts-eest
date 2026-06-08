"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  FileText,
  MessageSquarePlus,
  NotebookPen,
  Send,
  UserRound,
  Users
} from "lucide-react";

import { PriorityBadge } from "@/components/tickets/priority-badge";
import { StatusBadge } from "@/components/tickets/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDuration } from "@/lib/utils";
import type {
  Ticket,
  TicketNote,
  TicketPriority,
  TicketStatus
} from "@/types/ticket";
import type { SafeUser } from "@/types/user";

type TechnicianOption = Pick<SafeUser, "id" | "nombre">;

type TicketDetailSheetProps = {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (ticketId: number, status: TicketStatus) => void;
  onAddNote: (ticketId: number, text: string, type: TicketNote["type"]) => void;
  technicians?: TechnicianOption[];
  onSaveAssignment?: (
    ticketId: number,
    technicianId: number | null,
    priority: TicketPriority
  ) => void;
  allowInternalComments?: boolean;
  readOnly?: boolean;
};

export function TicketDetailSheet({
  ticket,
  open,
  onOpenChange,
  onStatusChange,
  onAddNote,
  technicians = [],
  onSaveAssignment,
  allowInternalComments = true,
  readOnly = false
}: TicketDetailSheetProps) {
  const [observation, setObservation] = useState("");
  const [internalComment, setInternalComment] = useState("");
  const [assignmentTechnicianId, setAssignmentTechnicianId] = useState("UNASSIGNED");
  const [assignmentPriority, setAssignmentPriority] =
    useState<TicketPriority>("SIN ASIGNAR");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setObservation("");
    setInternalComment("");
    setFeedback("");

    if (!ticket) {
      return;
    }

    setAssignmentTechnicianId(
      ticket.assignedTechnicianId ? String(ticket.assignedTechnicianId) : "UNASSIGNED"
    );
    setAssignmentPriority(ticket.priority);
  }, [ticket]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const sortedHistory = useMemo(() => {
    return [...(ticket?.history ?? [])].sort(
      (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
    );
  }, [ticket]);

  const observations = useMemo(() => {
    return ticket?.notes.filter((note) => note.type === "OBSERVACION") ?? [];
  }, [ticket]);

  const internalComments = useMemo(() => {
    return ticket?.notes.filter((note) => note.type === "COMENTARIO") ?? [];
  }, [ticket]);

  const technicianOptions = useMemo(() => {
    if (!ticket) {
      return [];
    }

    const currentOption = ticket.assignedTechnicianId
      ? {
          id: ticket.assignedTechnicianId,
          nombre: ticket.assignedTechnicianName ?? "Sin asignar"
        }
      : null;

    const options = [...technicians];

    if (
      currentOption &&
      !options.some((technician) => technician.id === currentOption.id)
    ) {
      options.push(currentOption);
    }

    return options.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [technicians, ticket]);

  function showFeedback(message: string) {
    setFeedback(message);
  }

  function submitNote(type: TicketNote["type"]) {
    if (!ticket || readOnly) {
      return;
    }

    const value = type === "OBSERVACION" ? observation : internalComment;

    if (!value.trim()) {
      return;
    }

    onAddNote(ticket.id, value, type);
    showFeedback(
      type === "OBSERVACION" ? "Observacion agregada." : "Comentario guardado."
    );

    if (type === "OBSERVACION") {
      setObservation("");
    } else {
      setInternalComment("");
    }
  }

  function handleSaveAssignment() {
    if (!ticket || !onSaveAssignment || readOnly) {
      return;
    }

    if (assignmentTechnicianId !== "UNASSIGNED" && assignmentPriority === "SIN ASIGNAR") {
      showFeedback("Selecciona una prioridad antes de asignar un tecnico.");
      return;
    }

    const nextTechnicianId =
      assignmentTechnicianId === "UNASSIGNED"
        ? null
        : Number.parseInt(assignmentTechnicianId, 10);

    onSaveAssignment(
      ticket.id,
      Number.isNaN(nextTechnicianId) ? null : nextTechnicianId,
      assignmentPriority
    );
    showFeedback("Asignacion guardada.");
  }

  const assignedTechnicianLabel = ticket?.assignedTechnicianName ?? "Sin asignar";
  const assignedTechnicianState = ticket?.assignedTechnicianId ? "Asignado" : "Sin asignar";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto p-0 scrollbar-clean">
        {ticket ? (
          <>
            <div className="border-b px-6 py-5">
              <SheetHeader className="pr-8">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <span className="rounded-md border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    #{ticket.id}
                  </span>
                </div>
                <SheetTitle>{ticket.category}</SheetTitle>
                <SheetDescription>{ticket.area}</SheetDescription>
              </SheetHeader>
            </div>

            <div className="space-y-6 px-6 py-5">
              {feedback ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {feedback}
                </div>
              ) : null}

              <section className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <UserRound className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Usuario creador</p>
                    <p className="font-medium">{ticket.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha de creacion</p>
                    <p className="font-medium">{formatDate(ticket.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <Users className="h-4 w-4 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Tecnico asignado</p>
                    <p className="font-medium">{assignedTechnicianLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {assignedTechnicianState}
                      {ticket.assignedAt ? ` · ${formatDate(ticket.assignedAt)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Resolucion</p>
                    <p className="font-medium">
                      {ticket.fechaResolucion
                        ? formatDate(ticket.fechaResolucion)
                        : "Pendiente"}
                    </p>
                    {ticket.fechaResolucion ? (
                      <p className="text-xs text-muted-foreground">
                        Tiempo total: {formatDuration(ticket.createdAt, ticket.fechaResolucion)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="rounded-lg border bg-card p-3">
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Descripcion del problema</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {ticket.description}
                </p>
              </section>

              {onSaveAssignment && !readOnly ? (
                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Asignacion y prioridad</h3>
                    <p className="text-sm text-muted-foreground">
                      Elegi el tecnico y la prioridad antes de guardar el cambio.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tecnico asignado</Label>
                      <Select
                        onValueChange={setAssignmentTechnicianId}
                        value={assignmentTechnicianId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNASSIGNED">Sin asignar</SelectItem>
                          {technicianOptions.map((technician) => (
                            <SelectItem key={technician.id} value={String(technician.id)}>
                              {technician.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Prioridad</Label>
                      <Select
                        onValueChange={(value) =>
                          setAssignmentPriority(value as TicketPriority)
                        }
                        value={assignmentPriority}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="SIN ASIGNAR" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SIN ASIGNAR">SIN ASIGNAR</SelectItem>
                          <SelectItem value="BAJA">BAJA</SelectItem>
                          <SelectItem value="MEDIA">MEDIA</SelectItem>
                          <SelectItem value="ALTA">ALTA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className="w-full sm:w-auto" onClick={handleSaveAssignment} type="button">
                    Guardar asignacion
                  </Button>
                </section>
              ) : null}

              {!readOnly ? (
                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Acciones</h3>
                    <p className="text-sm text-muted-foreground">
                      Actualiza el estado o registra actividad del ticket.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      onValueChange={(value) => {
                        onStatusChange(ticket.id, value as TicketStatus);
                        showFeedback("Estado actualizado.");
                      }}
                      value={ticket.status}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ABIERTO">ABIERTO</SelectItem>
                        <SelectItem value="EN PROCESO">EN PROCESO</SelectItem>
                        <SelectItem value="RESUELTO">RESUELTO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observation">Observacion tecnica</Label>
                    <Textarea
                      id="observation"
                      onChange={(event) => setObservation(event.target.value)}
                      placeholder="Agregar una observacion visible en el historial."
                      value={observation}
                    />
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => submitNote("OBSERVACION")}
                      type="button"
                    >
                      <NotebookPen className="h-4 w-4" />
                      Agregar observacion
                    </Button>
                  </div>

                  {allowInternalComments ? (
                    <div className="space-y-2">
                      <Label htmlFor="internal-comment">Comentario interno</Label>
                      <Textarea
                        id="internal-comment"
                        onChange={(event) => setInternalComment(event.target.value)}
                        placeholder="Registrar un comentario interno del equipo."
                        value={internalComment}
                      />
                      <Button
                        className="w-full sm:w-auto"
                        onClick={() => submitNote("COMENTARIO")}
                        type="button"
                        variant="secondary"
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                        Guardar comentario
                      </Button>
                    </div>
                  ) : null}
                </section>
              ) : null}

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Observaciones tecnicas</h3>
                  <p className="text-sm text-muted-foreground">
                    Registros del trabajo tecnico asociados al ticket.
                  </p>
                </div>

                {observations.length > 0 ? (
                  <div className="space-y-3">
                    {observations.map((note) => (
                      <article key={note.id} className="rounded-lg border bg-card p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{note.authorName}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {note.text}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed bg-card p-5 text-sm text-muted-foreground">
                    Todavia no hay observaciones tecnicas.
                  </div>
                )}
              </section>

              {allowInternalComments && internalComments.length > 0 ? (
                <section className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Comentarios internos</h3>
                    <p className="text-sm text-muted-foreground">
                      Solo visibles para administracion.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {internalComments.map((note) => (
                      <article key={note.id} className="rounded-lg border bg-card p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{note.authorName}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {note.text}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Historial</h3>
                </div>

                <div className="space-y-0">
                  {sortedHistory.map((event, index) => (
                    <div className="relative flex gap-3 pb-5" key={event.id}>
                      {index < sortedHistory.length - 1 ? (
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
                          {event.description}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Por {event.authorName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
