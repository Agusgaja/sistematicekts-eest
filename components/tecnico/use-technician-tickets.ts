"use client";

import { useEffect, useState } from "react";

import {
  addTicketNote,
  getActiveTickets,
  sortTicketsByPriority,
  updateTicketStatus
} from "@/lib/tickets";
import { useSessionGuard } from "@/components/auth/use-session-guard";
import type { Ticket, TicketNote, TicketStatus } from "@/types/ticket";

export function useTechnicianTickets() {
  const { user } = useSessionGuard(["TECNICO"]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const assignedTickets = getActiveTickets().filter(
      (ticket) => ticket.assignedTechnicianId === user.id
    );
    setTickets(sortTicketsByPriority(assignedTickets));
  }, [user]);

  function syncTickets(nextTickets: Ticket[], ticketId?: number) {
    const assignedTickets = nextTickets.filter(
      (ticket) => ticket.assignedTechnicianId === user?.id
    );
    const sortedTickets = sortTicketsByPriority(assignedTickets);
    setTickets(sortedTickets);

    if (ticketId) {
      setSelectedTicket(
        sortedTickets.find((ticket) => ticket.id === ticketId) ?? null
      );
    }
  }

  function canEdit(ticketId: number) {
    return tickets.some((ticket) => ticket.id === ticketId);
  }

  function handleStatusChange(ticketId: number, status: TicketStatus) {
    if (!user || !canEdit(ticketId)) {
      return;
    }

    syncTickets(updateTicketStatus(ticketId, status, user.nombre), ticketId);
  }

  function handleAddObservation(ticketId: number, text: string) {
    if (!user || !canEdit(ticketId)) {
      return;
    }

    syncTickets(addTicketNote(ticketId, text, "OBSERVACION", user.nombre), ticketId);
  }

  return {
    user,
    tickets,
    selectedTicket,
    setSelectedTicket,
    handleStatusChange,
    handleAddObservation
  };
}
