"use client";

import { useEffect, useState } from "react";

import {
  addTicketNote,
  getActiveTickets,
  updateTicketAssignmentAndPriority,
  updateTicketStatus
} from "@/lib/tickets";
import { getTechnicians, toSafeUser } from "@/lib/users";
import type {
  Ticket,
  TicketNote,
  TicketPriority,
  TicketStatus
} from "@/types/ticket";
import { useSessionGuard } from "@/components/auth/use-session-guard";
import type { SafeUser } from "@/types/user";

function sortTickets(tickets: Ticket[]) {
  return [...tickets].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  );
}

export function useAdminTickets() {
  const { user } = useSessionGuard(["ADMIN"]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [technicians, setTechnicians] = useState<SafeUser[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setTickets(sortTickets(getActiveTickets()));
    setTechnicians(getTechnicians().map((technician) => toSafeUser(technician)));
  }, [user]);

  function syncTickets(nextTickets: Ticket[], ticketId?: number) {
    const sortedTickets = sortTickets(nextTickets);

    setTickets(sortedTickets);

    if (ticketId) {
      setSelectedTicket(
        sortedTickets.find((ticket) => ticket.id === ticketId) ?? null
      );
    }
  }

  function handleStatusChange(ticketId: number, status: TicketStatus) {
    if (!user) {
      return;
    }

    syncTickets(updateTicketStatus(ticketId, status, user.nombre), ticketId);
  }

  function handleAddNote(
    ticketId: number,
    text: string,
    type: TicketNote["type"]
  ) {
    if (!user) {
      return;
    }

    syncTickets(addTicketNote(ticketId, text, type, user.nombre), ticketId);
  }

  function handleAssignmentChange(
    ticketId: number,
    technicianId: number | null,
    priority: TicketPriority
  ) {
    if (!user) {
      return;
    }

    const technician =
      technicianId === null
        ? null
        : technicians.find((item) => item.id === technicianId) ?? null;

    syncTickets(updateTicketAssignmentAndPriority(ticketId, technician, priority, user.nombre), ticketId);
  }

  return {
    user,
    tickets,
    technicians,
    selectedTicket,
    setSelectedTicket,
    handleStatusChange,
    handleAddNote,
    handleAssignmentChange
  };
}
