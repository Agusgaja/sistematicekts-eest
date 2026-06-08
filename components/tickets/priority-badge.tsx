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
      "bg-slate-500 border-transparent text-white hover:bg-slate-500/90 dark:bg-slate-700 dark:text-slate-100",
    icon: Minus
  },
  BAJA: {
    className:
      "bg-emerald-600 border-transparent text-white hover:bg-emerald-600/90 dark:bg-emerald-700 dark:text-emerald-100",
    icon: TrendingDown
  },
  MEDIA: {
    className:
      "bg-orange-500 border-transparent text-white hover:bg-orange-500/90 dark:bg-orange-600 dark:text-orange-100",
    icon: Circle
  },
  ALTA: {
    className:
      "bg-red-600 border-transparent text-white hover:bg-red-600/90 dark:bg-red-700 dark:text-red-100",
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
