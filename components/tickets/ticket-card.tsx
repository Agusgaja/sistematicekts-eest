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

      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
        {ticket.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground border-t pt-2.5">
        {showUser ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <UserRound className="h-3 w-3 shrink-0 text-primary/70" />
            <span className="truncate font-medium text-foreground/80">{ticket.userName}</span>
          </div>
        ) : null}
        {showTechnician ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <Users className="h-3 w-3 shrink-0 text-primary/70" />
            <span className="truncate font-medium text-foreground/80">
              {ticket.assignedTechnicianName ?? "Sin asignar"}
            </span>
          </div>
        ) : null}
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="h-3 w-3 shrink-0 text-primary/70" />
          <span className="truncate">{ticket.area}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0 ml-auto">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span>{formatDate(ticket.createdAt)}</span>
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        className="group w-full rounded-lg border bg-card p-4 text-left shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      className="rounded-lg border bg-card p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30"
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
