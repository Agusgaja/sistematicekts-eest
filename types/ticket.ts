export const TICKET_AREAS = [
  "AULA 1",
  "AULA 2",
  "AULA 3",
  "AULA 4",
  "DIRECCION",
  "VICEDIRECCION",
  "PRECEPTORIA"
] as const;

export const TICKET_CATEGORIES = [
  "PROGRAMAS O APLICACIONES",
  "RED",
  "CPU",
  "MONITOR",
  "IMPRESORAS",
  "CORREO ELECTRONICO",
  "MOUSE O TECLADO",
  "TONER",
  "USUARIOS Y CLAVES DEL SISTEMA"
] as const;

export const TICKET_PRIORITIES = [
  "SIN ASIGNAR",
  "BAJA",
  "MEDIA",
  "ALTA"
] as const;

export const TICKET_STATUSES = [
  "ABIERTO",
  "EN PROCESO",
  "RESUELTO"
] as const;

export type TicketArea = (typeof TICKET_AREAS)[number];
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type TicketHistoryType =
  | "CREADO"
  | "ASIGNACION"
  | "ESTADO"
  | "PRIORIDAD"
  | "OBSERVACION"
  | "COMENTARIO"
  | "ARCHIVO";

export type TicketHistoryEvent = {
  id: string;
  type: TicketHistoryType;
  title: string;
  description: string;
  authorName: string;
  createdAt: string;
};

export type TicketNote = {
  id: string;
  type: Extract<TicketHistoryType, "OBSERVACION" | "COMENTARIO">;
  text: string;
  authorName: string;
  createdAt: string;
};

export type Ticket = {
  id: number;
  userId: number;
  userName: string;
  area: TicketArea;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTechnicianId: number | null;
  assignedTechnicianName: string | null;
  assignedAt: string | null;
  fechaResolucion: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  notes: TicketNote[];
  history: TicketHistoryEvent[];
};

export type NewTicketInput = {
  area: TicketArea;
  category: TicketCategory;
  description: string;
};
