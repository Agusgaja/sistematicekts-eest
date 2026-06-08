"use client";

import {
  Archive,
  ArrowRightLeft,
  CalendarDays,
  FileCheck2,
  FilePlus,
  Flame,
  MessageSquareCode,
  UserCheck2
} from "lucide-react";
import type { TicketHistoryEvent, TicketHistoryType } from "@/types/ticket";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TicketTimelineProps = {
  history: TicketHistoryEvent[];
};

const timelineIconConfig: Record<
  TicketHistoryType,
  {
    icon: typeof FilePlus;
    bgColor: string;
    iconColor: string;
  }
> = {
  CREADO: {
    icon: FilePlus,
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColor: "text-blue-500"
  },
  ASIGNACION: {
    icon: UserCheck2,
    bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-500"
  },
  ESTADO: {
    icon: ArrowRightLeft,
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColor: "text-amber-500"
  },
  PRIORIDAD: {
    icon: Flame,
    bgColor: "bg-red-500/10 dark:bg-red-500/20",
    iconColor: "text-red-500"
  },
  OBSERVACION: {
    icon: MessageSquareCode,
    bgColor: "bg-teal-500/10 dark:bg-teal-500/20",
    iconColor: "text-teal-500"
  },
  COMENTARIO: {
    icon: MessageSquareCode,
    bgColor: "bg-slate-500/10 dark:bg-slate-500/20",
    iconColor: "text-slate-500"
  },
  ARCHIVO: {
    icon: Archive,
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconColor: "text-emerald-500"
  }
};

export function TicketTimeline({ history }: TicketTimelineProps) {
  const sortedHistory = [...history].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) // Newest first for activity feed
  );

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sortedHistory.map((event, idx) => {
          const config = timelineIconConfig[event.type] || {
            icon: FileCheck2,
            bgColor: "bg-slate-500/10",
            iconColor: "text-slate-500"
          };
          const Icon = config.icon;

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {idx !== sortedHistory.length - 1 ? (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-border/60"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg ring-8 ring-background",
                        config.bgColor
                      )}
                    >
                      <Icon className={cn("h-5 w-5", config.iconColor)} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {event.title}{" "}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground/80 flex items-center gap-1">
                        <span className="font-medium text-foreground/75">{event.authorName}</span>
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-muted-foreground/80 flex items-center gap-1.5 shrink-0 self-start">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{formatDate(event.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {sortedHistory.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No hay actividad registrada.
          </div>
        )}
      </ul>
    </div>
  );
}
