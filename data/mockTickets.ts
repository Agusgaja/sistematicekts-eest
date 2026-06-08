import type { Ticket } from "@/types/ticket";

export const mockTickets: Ticket[] = [
  {
    id: 1001,
    userId: 2,
    userName: "Usuario Demo",
    area: "AULA 2",
    category: "RED",
    description:
      "La computadora docente no logra conectarse a internet y la clase necesita acceso a la plataforma.",
    status: "ABIERTO",
    priority: "SIN ASIGNAR",
    assignedTechnicianId: null,
    assignedTechnicianName: null,
    assignedAt: null,
    fechaResolucion: null,
    archivedAt: null,
    createdAt: "2026-05-27T10:15:00-03:00",
    updatedAt: "2026-05-27T10:15:00-03:00",
    notes: [],
    history: [
      {
        id: "evt-1001-1",
        type: "CREADO",
        title: "Ticket creado",
        description: "El usuario Usuario Demo creó el ticket.",
        authorName: "Usuario Demo",
        createdAt: "2026-05-27T10:15:00-03:00"
      }
    ]
  },
  {
    id: 1002,
    userId: 2,
    userName: "Usuario Demo",
    area: "DIRECCION",
    category: "IMPRESORAS",
    description:
      "La impresora principal toma papel, pero no imprime los documentos enviados desde secretaria.",
    status: "EN PROCESO",
    priority: "MEDIA",
    assignedTechnicianId: 3,
    assignedTechnicianName: "Tecnico Demo",
    assignedAt: "2026-05-26T09:10:00-03:00",
    fechaResolucion: null,
    archivedAt: null,
    createdAt: "2026-05-25T14:30:00-03:00",
    updatedAt: "2026-05-26T09:20:00-03:00",
    notes: [
      {
        id: "note-1002-1",
        type: "OBSERVACION",
        text: "Se revisó la cola de impresión y queda pendiente verificar tóner.",
        authorName: "Administrador",
        createdAt: "2026-05-26T09:20:00-03:00"
      }
    ],
    history: [
      {
        id: "evt-1002-1",
        type: "CREADO",
        title: "Ticket creado",
        description: "El usuario Usuario Demo creó el ticket.",
        authorName: "Usuario Demo",
        createdAt: "2026-05-25T14:30:00-03:00"
      },
      {
        id: "evt-1002-2",
        type: "ASIGNACION",
        title: "Técnico asignado",
        description: "Ticket asignado a Tecnico Demo.",
        authorName: "Administrador",
        createdAt: "2026-05-26T09:10:00-03:00"
      },
      {
        id: "evt-1002-3",
        type: "ESTADO",
        title: "Estado actualizado",
        description: "El ticket pasó de ABIERTO a EN PROCESO.",
        authorName: "Administrador",
        createdAt: "2026-05-26T09:15:00-03:00"
      },
      {
        id: "evt-1002-4",
        type: "OBSERVACION",
        title: "Observación agregada",
        description:
          "Se revisó la cola de impresión y queda pendiente verificar tóner.",
        authorName: "Administrador",
        createdAt: "2026-05-26T09:20:00-03:00"
      }
    ]
  },
  {
    id: 1003,
    userId: 2,
    userName: "Usuario Demo",
    area: "PRECEPTORIA",
    category: "USUARIOS Y CLAVES DEL SISTEMA",
    description:
      "Se requiere restablecer la clave del sistema de asistencia para el usuario de preceptoria.",
    status: "RESUELTO",
    priority: "ALTA",
    assignedTechnicianId: null,
    assignedTechnicianName: null,
    assignedAt: null,
    fechaResolucion: "2026-05-21T12:40:00-03:00",
    archivedAt: null,
    createdAt: "2026-05-20T08:05:00-03:00",
    updatedAt: "2026-05-21T12:40:00-03:00",
    notes: [
      {
        id: "note-1003-1",
        type: "COMENTARIO",
        text: "Clave temporal generada y comunicada por canal interno.",
        authorName: "Administrador",
        createdAt: "2026-05-21T12:35:00-03:00"
      }
    ],
    history: [
      {
        id: "evt-1003-1",
        type: "CREADO",
        title: "Ticket creado",
        description: "El usuario Usuario Demo creó el ticket.",
        authorName: "Usuario Demo",
        createdAt: "2026-05-20T08:05:00-03:00"
      },
      {
        id: "evt-1003-2",
        type: "ESTADO",
        title: "Estado actualizado",
        description: "El ticket pasó de ABIERTO a EN PROCESO.",
        authorName: "Administrador",
        createdAt: "2026-05-20T11:10:00-03:00"
      },
      {
        id: "evt-1003-3",
        type: "COMENTARIO",
        title: "Comentario interno agregado",
        description: "Clave temporal generada y comunicada por canal interno.",
        authorName: "Administrador",
        createdAt: "2026-05-21T12:35:00-03:00"
      },
      {
        id: "evt-1003-4",
        type: "ESTADO",
        title: "Estado actualizado",
        description: "El ticket pasó de EN PROCESO a RESUELTO.",
        authorName: "Administrador",
        createdAt: "2026-05-21T12:40:00-03:00"
      }
    ]
  }
];
