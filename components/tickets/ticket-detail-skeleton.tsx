"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type TicketDetailSkeletonProps = {
  backPath: string;
  backLabel: string;
  title?: string;
};

export function TicketDetailSkeleton({
  backPath,
  backLabel,
  title = "Cargando Ticket..."
}: TicketDetailSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header action simulation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="h-7 w-48 bg-muted rounded animate-pulse" />
          <div className="mt-2 h-4 w-72 bg-muted/65 rounded animate-pulse" />
        </div>
        <Button disabled variant="outline" size="sm" className="gap-2 opacity-50">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column Skeleton */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border bg-card/60 p-5 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                <div className="h-5 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-14 bg-muted/40 rounded-lg animate-pulse" />
              <div className="h-14 bg-muted/40 rounded-lg animate-pulse" />
            </div>

            <div className="h-12 bg-muted/40 rounded-lg animate-pulse" />
            <div className="h-28 bg-muted/40 rounded-lg animate-pulse" />

            <div className="border-t pt-4 space-y-2">
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-8 bg-muted/45 rounded animate-pulse" />
                <div className="h-8 bg-muted/45 rounded animate-pulse" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card/60 p-5 h-40 animate-pulse" />
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border bg-card/60 p-5 space-y-4">
            <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted/45 rounded-lg animate-pulse" />
            <div className="h-16 bg-muted/45 rounded-lg animate-pulse" />
          </div>

          <div className="rounded-xl border bg-card/60 p-5 space-y-4">
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-12 bg-muted/30 rounded animate-pulse" />
              <div className="h-12 bg-muted/30 rounded animate-pulse" />
              <div className="h-12 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
