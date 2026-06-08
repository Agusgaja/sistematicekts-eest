"use client";

import { CalendarDays, MapPin, UserRound, Users } from "lucide-react";

import { PriorityBadge } from "@/components/tickets/priority-badge";
import { StatusBadge } from "@/components/tickets/status-badge";
import { formatDate, shortText } from "@/lib/utils";
import type { Ticket } from "@/types/ticket";

type TicketCardProps = {
  ticket: Ticket;
  showUser?: boolean;
  showTechnician?: boolean;
  onClick?: (ticket: Ticket) => void;
  draggable?: boolean;
  onDragStart?: (ticket: Ticket) => void;
  onDragEnd?: (ticket: Ticket) => void;
};

export function TicketCard({
  ticket,
  showUser = false,
  showTechnician = false,
  onClick,
  draggable = false,
  onDragStart,
  onDragEnd
}: TicketCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Ticket #{ticket.id}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
            {ticket.category}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {shortText(ticket.description, 150)}
      </p>

      <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
        {showUser ? (
          <div className="flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5" />
            <span className="truncate">{ticket.userName}</span>
          </div>
        ) : null}
        {showTechnician ? (
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            <span className="truncate">
              {ticket.assignedTechnicianName ?? "Sin asignar"}
            </span>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{ticket.area}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{formatDate(ticket.createdAt)}</span>
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        className="group w-full rounded-lg border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        draggable={draggable}
        onDragEnd={() => onDragEnd?.(ticket)}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", String(ticket.id));
          onDragStart?.(ticket);
        }}
        onClick={() => onClick(ticket)}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <article
      className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/30"
      draggable={draggable}
      onDragEnd={() => onDragEnd?.(ticket)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(ticket.id));
        onDragStart?.(ticket);
      }}
    >
      {content}
    </article>
  );
}
