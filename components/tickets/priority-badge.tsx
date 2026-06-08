import { Circle, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TicketPriority } from "@/types/ticket";

const priorityStyles: Record<
  TicketPriority,
  {
    className: string;
    icon: typeof Circle;
  }
> = {
  "SIN ASIGNAR": {
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200",
    icon: Minus
  },
  BAJA: {
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200",
    icon: TrendingDown
  },
  MEDIA: {
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200",
    icon: Circle
  },
  ALTA: {
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200",
    icon: TrendingUp
  }
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = priorityStyles[priority];
  const Icon = config.icon;

  return (
    <Badge
      className={cn("gap-1.5 whitespace-nowrap font-medium", config.className)}
      variant="outline"
    >
      <Icon className="h-3.5 w-3.5" />
      {priority}
    </Badge>
  );
}
