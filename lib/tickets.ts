import { mockTickets } from "@/data/mockTickets";
import type { SafeUser } from "@/types/user";
import type {
  NewTicketInput,
  Ticket,
  TicketHistoryEvent,
  TicketNote,
  TicketPriority,
  TicketStatus
} from "@/types/ticket";

const TICKETS_STORAGE_KEY = "ticket-system:tickets";
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
const PRIORITY_ORDER: TicketPriority[] = [
  "ALTA",
  "MEDIA",
  "BAJA",
  "SIN ASIGNAR"
];

function hasStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function priorityWeight(priority: TicketPriority) {
  return PRIORITY_ORDER.indexOf(priority);
}

function normalizePriority(value: unknown): TicketPriority {
  switch (String(value ?? "").toUpperCase()) {
    case "ALTA":
      return "ALTA";
    case "MEDIA":
      return "MEDIA";
    case "BAJA":
      return "BAJA";
    default:
      return "SIN ASIGNAR";
  }
}

function parseDateOrNull(value: unknown) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(String(value));

  return Number.isNaN(timestamp) ? null : String(value);
}

function normalizeHistoryEvent(
  event: Partial<TicketHistoryEvent> & { type?: TicketHistoryEvent["type"] }
): TicketHistoryEvent {
  return {
    id: String(event.id ?? makeId("evt")),
    type: event.type ?? "CREADO",
    title: String(event.title ?? ""),
    description: String(event.description ?? ""),
    authorName: String(event.authorName ?? ""),
    createdAt: String(event.createdAt ?? new Date().toISOString())
  };
}

function normalizeNote(
  note: Partial<TicketNote> & { type?: TicketNote["type"] }
): TicketNote {
  return {
    id: String(note.id ?? makeId("note")),
    type: note.type ?? "OBSERVACION",
    text: String(note.text ?? ""),
    authorName: String(note.authorName ?? ""),
    createdAt: String(note.createdAt ?? new Date().toISOString())
  };
}

export function normalizeTicket(ticket: Partial<Ticket>): Ticket {
  const history = Array.isArray(ticket.history)
    ? ticket.history.map((event) => normalizeHistoryEvent(event))
    : [];
  const notes = Array.isArray(ticket.notes)
    ? ticket.notes.map((note) => normalizeNote(note))
    : [];

  return {
    id: Number(ticket.id ?? 0),
    userId: Number(ticket.userId ?? 0),
    userName: String(ticket.userName ?? ""),
    area: ticket.area ?? "AULA 1",
    category: ticket.category ?? "PROGRAMAS O APLICACIONES",
    description: String(ticket.description ?? ""),
    status: ticket.status ?? "ABIERTO",
    priority: normalizePriority(ticket.priority),
    assignedTechnicianId:
      ticket.assignedTechnicianId === undefined
        ? null
        : ticket.assignedTechnicianId === null
          ? null
          : Number(ticket.assignedTechnicianId),
    assignedTechnicianName:
      ticket.assignedTechnicianName === undefined
        ? null
        : ticket.assignedTechnicianName === null
          ? null
          : String(ticket.assignedTechnicianName),
    assignedAt:
      ticket.assignedAt === undefined
        ? null
        : ticket.assignedAt === null
          ? null
          : String(ticket.assignedAt),
    fechaResolucion:
      ticket.fechaResolucion !== undefined
        ? parseDateOrNull(ticket.fechaResolucion)
        : ticket.status === "RESUELTO"
          ? String(ticket.updatedAt ?? new Date().toISOString())
          : null,
    archivedAt:
      ticket.archivedAt !== undefined
        ? parseDateOrNull(ticket.archivedAt)
        : null,
    createdAt: String(ticket.createdAt ?? new Date().toISOString()),
    updatedAt: String(ticket.updatedAt ?? new Date().toISOString()),
    notes,
    history
  };
}

function cloneSeedTickets() {
  return mockTickets.map((ticket) => normalizeTicket(ticket));
}

function sortTickets(tickets: Ticket[]) {
  return [...tickets].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  );
}

export function sortTicketsByUpdatedAt(tickets: Ticket[]) {
  return sortTickets(tickets);
}

export function sortTicketsByPriority(tickets: Ticket[]) {
  return [...tickets].sort((a, b) => {
    const priorityDiff = priorityWeight(a.priority) - priorityWeight(b.priority);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const createdAtDiff = Date.parse(a.createdAt) - Date.parse(b.createdAt);

    if (createdAtDiff !== 0) {
      return createdAtDiff;
    }

    return a.id - b.id;
  });
}

function sortHistory(history: TicketHistoryEvent[]) {
  return [...history].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );
}

function buildHistoryEvent(params: {
  type: TicketHistoryEvent["type"];
  title: string;
  description: string;
  authorName: string;
  createdAt: string;
}) {
  return {
    id: makeId("evt"),
    ...params
  } satisfies TicketHistoryEvent;
}

function buildPriorityHistoryEvent(params: {
  previousPriority: TicketPriority;
  nextPriority: TicketPriority;
  authorName: string;
  createdAt: string;
}) {
  const title =
    params.previousPriority === "SIN ASIGNAR"
      ? "Prioridad asignada"
      : "Prioridad modificada";
  const description =
    params.previousPriority === "SIN ASIGNAR"
      ? `Prioridad asignada: ${params.nextPriority}.`
      : `Prioridad modificada de ${params.previousPriority} a ${params.nextPriority}.`;

  return buildHistoryEvent({
    type: "PRIORIDAD",
    title,
    description,
    authorName: params.authorName,
    createdAt: params.createdAt
  });
}

function isTicketArchived(ticket: Ticket) {
  return Boolean(ticket.archivedAt);
}

export function getActiveTickets() {
  return sortTickets(getTickets().filter((ticket) => !isTicketArchived(ticket)));
}

export function getArchivedTickets() {
  return [...getTickets().filter((ticket) => isTicketArchived(ticket))].sort(
    (a, b) => {
      const priorityDiff = priorityWeight(a.priority) - priorityWeight(b.priority);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const archivedAtA = Date.parse(a.archivedAt ?? a.fechaResolucion ?? a.updatedAt);
      const archivedAtB = Date.parse(b.archivedAt ?? b.fechaResolucion ?? b.updatedAt);

      if (archivedAtA !== archivedAtB) {
        return archivedAtB - archivedAtA;
      }

      return a.id - b.id;
    }
  );
}

function archiveIfNeeded(ticket: Ticket, now: string) {
  if (ticket.status !== "RESUELTO" || !ticket.fechaResolucion) {
    if (ticket.archivedAt) {
      return {
        ...ticket,
        archivedAt: null,
        updatedAt: now
      };
    }

    return ticket;
  }

  if (ticket.archivedAt) {
    return ticket;
  }

  const resolutionDate = Date.parse(ticket.fechaResolucion);

  if (Number.isNaN(resolutionDate)) {
    return ticket;
  }

  if (Date.now() - resolutionDate < SEVEN_DAYS_IN_MS) {
    return ticket;
  }

  const archiveEvent = buildHistoryEvent({
    type: "ARCHIVO",
    title: "Ticket enviado al Registro",
    description: "El ticket se movio automaticamente al Registro.",
    authorName: "Sistema",
    createdAt: now
  });

  return {
    ...ticket,
    archivedAt: now,
    updatedAt: now,
    history: sortHistory([...ticket.history, archiveEvent])
  };
}

function applyAutomaticArchival(tickets: Ticket[]) {
  const now = new Date().toISOString();
  let changed = false;

  const nextTickets = tickets.map((ticket) => {
    const nextTicket = archiveIfNeeded(ticket, now);

    if (nextTicket !== ticket) {
      changed = true;
    }

    return nextTicket;
  });

  return {
    tickets: nextTickets,
    changed
  };
}

export function getTickets(): Ticket[] {
  if (!hasStorage()) {
    const seedTickets = sortTickets(cloneSeedTickets());
    const archivedSeedTickets = applyAutomaticArchival(seedTickets);
    return sortTickets(archivedSeedTickets.tickets);
  }

  const rawTickets = window.localStorage.getItem(TICKETS_STORAGE_KEY);

  if (!rawTickets) {
    const seedTickets = sortTickets(cloneSeedTickets());
    const archivedSeedTickets = applyAutomaticArchival(seedTickets);
    saveTickets(archivedSeedTickets.tickets);
    return sortTickets(archivedSeedTickets.tickets);
  }

  try {
    const parsedTickets = JSON.parse(rawTickets) as Array<Partial<Ticket>>;
    const normalizedTickets = sortTickets(
      parsedTickets.map((ticket) => normalizeTicket(ticket))
    );
    const archivedTickets = applyAutomaticArchival(normalizedTickets);
    if (archivedTickets.changed) {
      saveTickets(archivedTickets.tickets);
    } else {
      saveTickets(normalizedTickets);
    }
    return sortTickets(archivedTickets.tickets);
  } catch {
    const seedTickets = sortTickets(cloneSeedTickets());
    const archivedSeedTickets = applyAutomaticArchival(seedTickets);
    saveTickets(archivedSeedTickets.tickets);
    return sortTickets(archivedSeedTickets.tickets);
  }
}

export function saveTickets(tickets: Ticket[]) {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(
    TICKETS_STORAGE_KEY,
    JSON.stringify(sortTickets(tickets))
  );
}

export function createTicket(input: NewTicketInput, user: SafeUser) {
  const tickets = getTickets();
  const now = new Date().toISOString();
  const nextId =
    tickets.length > 0 ? Math.max(...tickets.map((ticket) => ticket.id)) + 1 : 1;

  const historyEvent = buildHistoryEvent({
    type: "CREADO",
    title: "Ticket creado",
    description: `El usuario ${user.nombre} creó el ticket.`,
    authorName: user.nombre,
    createdAt: now
  });

  const ticket: Ticket = {
    id: nextId,
    userId: user.id,
    userName: user.nombre,
    area: input.area,
    category: input.category,
    description: input.description.trim(),
    status: "ABIERTO",
    priority: "SIN ASIGNAR",
    assignedTechnicianId: null,
    assignedTechnicianName: null,
    assignedAt: null,
    fechaResolucion: null,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
    notes: [],
    history: [historyEvent]
  };

  const nextTickets = [ticket, ...tickets];
  saveTickets(nextTickets);

  return ticket;
}

export function updateTicketStatus(
  ticketId: number,
  nextStatus: TicketStatus,
  authorName: string
): Ticket[] {
  const tickets = getTickets();
  const now = new Date().toISOString();

  const nextTickets = tickets.map((ticket) => {
    if (ticket.id !== ticketId || ticket.status === nextStatus) {
      return ticket;
    }

    const previousStatus = ticket.status;
    const historyEvent = buildHistoryEvent({
      type: "ESTADO",
      title: nextStatus === "RESUELTO" ? "Ticket resuelto" : "Estado actualizado",
      description: `Estado cambiado de ${previousStatus} a ${nextStatus}.`,
      authorName,
      createdAt: now
    });

    return {
      ...ticket,
      status: nextStatus,
      fechaResolucion: nextStatus === "RESUELTO" ? now : null,
      archivedAt: null,
      updatedAt: now,
      history: sortHistory([...ticket.history, historyEvent])
    };
  });

  saveTickets(nextTickets);
  return nextTickets;
}

export function updateTicketPriority(
  ticketId: number,
  nextPriority: TicketPriority,
  authorName: string
) {
  const tickets = getTickets();
  const now = new Date().toISOString();

  const nextTickets = tickets.map((ticket) => {
    if (ticket.id !== ticketId || ticket.priority === nextPriority) {
      return ticket;
    }

    const historyEvent = buildPriorityHistoryEvent({
      previousPriority: ticket.priority,
      nextPriority,
      authorName,
      createdAt: now
    });

    return {
      ...ticket,
      priority: nextPriority,
      updatedAt: now,
      history: sortHistory([...ticket.history, historyEvent])
    };
  });

  saveTickets(nextTickets);
  return nextTickets;
}

export function updateTicketAssignmentAndPriority(
  ticketId: number,
  technician: SafeUser | null,
  nextPriority: TicketPriority,
  authorName: string
) {
  const tickets = getTickets();
  const now = new Date().toISOString();

  const nextTickets = tickets.map((ticket) => {
    if (ticket.id !== ticketId) {
      return ticket;
    }

    const historyEvents: TicketHistoryEvent[] = [];
    const nextTechnicianId = technician?.id ?? null;
    const nextTechnicianName = technician?.nombre ?? null;
    let updatedTicket = ticket;

    if (
      ticket.assignedTechnicianId !== nextTechnicianId ||
      ticket.assignedTechnicianName !== nextTechnicianName
    ) {
      let historyTitle = "Tecnico asignado";
      let historyDescription = nextTechnicianName
        ? `Ticket asignado a ${nextTechnicianName}.`
        : "Se quito la asignacion del ticket.";

      if (ticket.assignedTechnicianName && nextTechnicianName) {
        historyTitle = "Tecnico cambiado";
        historyDescription = `Tecnico cambiado de ${ticket.assignedTechnicianName} a ${nextTechnicianName}.`;
      } else if (ticket.assignedTechnicianName && !nextTechnicianName) {
        historyTitle = "Tecnico desasignado";
        historyDescription = `Se quito la asignacion de ${ticket.assignedTechnicianName}.`;
      }

      historyEvents.push(
        buildHistoryEvent({
          type: "ASIGNACION",
          title: historyTitle,
          description: historyDescription,
          authorName,
          createdAt: now
        })
      );

      updatedTicket = {
        ...updatedTicket,
        assignedTechnicianId: nextTechnicianId,
        assignedTechnicianName: nextTechnicianName,
        assignedAt: nextTechnicianId ? now : null
      };
    }

    if (ticket.priority !== nextPriority) {
      historyEvents.push(
        buildPriorityHistoryEvent({
          previousPriority: ticket.priority,
          nextPriority,
          authorName,
          createdAt: now
        })
      );

      updatedTicket = {
        ...updatedTicket,
        priority: nextPriority
      };
    }

    if (historyEvents.length === 0) {
      return ticket;
    }

    return {
      ...updatedTicket,
      updatedAt: now,
      history: sortHistory([...ticket.history, ...historyEvents])
    };
  });

  saveTickets(nextTickets);
  return nextTickets;
}

export function addTicketNote(
  ticketId: number,
  text: string,
  type: TicketNote["type"],
  authorName: string
): Ticket[] {
  const tickets = getTickets();
  const trimmedText = text.trim();

  if (!trimmedText) {
    return tickets;
  }

  const now = new Date().toISOString();

  const note: TicketNote = {
    id: makeId("note"),
    type,
    text: trimmedText,
    authorName,
    createdAt: now
  };

  const historyEvent = buildHistoryEvent({
    type,
    title:
      type === "OBSERVACION"
        ? "Observación agregada"
        : "Comentario interno agregado",
    description: trimmedText,
    authorName,
    createdAt: now
  });

  const nextTickets = tickets.map((ticket) => {
    if (ticket.id !== ticketId) {
      return ticket;
    }

    return {
      ...ticket,
      updatedAt: now,
      notes: [...ticket.notes, note],
      history: sortHistory([...ticket.history, historyEvent])
    };
  });

  saveTickets(nextTickets);
  return nextTickets;
}

export function assignTicketTechnician(
  ticketId: number,
  technician: SafeUser | null,
  authorName: string
): Ticket[] {
  const tickets = getTickets();
  const now = new Date().toISOString();

  const nextTickets = tickets.map((ticket) => {
    if (ticket.id !== ticketId) {
      return ticket;
    }

    const currentTechnicianId = ticket.assignedTechnicianId;
    const currentTechnicianName = ticket.assignedTechnicianName;
    const nextTechnicianId = technician?.id ?? null;
    const nextTechnicianName = technician?.nombre ?? null;

    if (
      currentTechnicianId === nextTechnicianId &&
      currentTechnicianName === nextTechnicianName
    ) {
      return ticket;
    }

    let historyTitle = "Técnico asignado";
    let historyDescription = nextTechnicianName
      ? `Ticket asignado a ${nextTechnicianName}.`
      : "Se quitó la asignación del ticket.";

    if (currentTechnicianName && nextTechnicianName) {
      historyTitle = "Técnico cambiado";
      historyDescription = `Técnico cambiado de ${currentTechnicianName} a ${nextTechnicianName}.`;
    } else if (currentTechnicianName && !nextTechnicianName) {
      historyTitle = "Técnico desasignado";
      historyDescription = `Se quitó la asignación de ${currentTechnicianName}.`;
    }

    const historyEvent = buildHistoryEvent({
      type: "ASIGNACION",
      title: historyTitle,
      description: historyDescription,
      authorName,
      createdAt: now
    });

    return {
      ...ticket,
      assignedTechnicianId: nextTechnicianId,
      assignedTechnicianName: nextTechnicianName,
      assignedAt: nextTechnicianId ? now : null,
      updatedAt: now,
      history: sortHistory([...ticket.history, historyEvent])
    };
  });

  saveTickets(nextTickets);
  return nextTickets;
}
