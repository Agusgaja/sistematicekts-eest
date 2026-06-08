import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/types/ticket";

const statusStyles: Record<
  TicketStatus,
  {
    className: string;
    icon: typeof CircleAlert;
  }
> = {
  ABIERTO: {
    className:
      "border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200",
    icon: CircleAlert
  },
  "EN PROCESO": {
    className:
      "border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200",
    icon: LoaderCircle
  },
  RESUELTO: {
    className:
      "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: CheckCircle2
  }
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusStyles[status];
  const Icon = config.icon;

  return (
    <Badge
      className={cn("gap-1.5 whitespace-nowrap font-medium", config.className)}
      variant="outline"
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </Badge>
  );
}
