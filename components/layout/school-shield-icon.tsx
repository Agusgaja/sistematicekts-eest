import { Ticket } from "lucide-react";

import { cn } from "@/lib/utils";

type SchoolShieldIconProps = {
  className?: string;
};

export function SchoolShieldIcon({ className }: SchoolShieldIconProps) {
  return (
    <Ticket
      aria-hidden="true"
      className={cn("shrink-0 transition-colors duration-200", className)}
      strokeWidth={1.75}
    />
  );
}
