"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ClipboardList, ListChecks, Plus, RotateCcw, TicketPlus } from "lucide-react";

import { useSessionGuard } from "@/components/auth/use-session-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { TicketCard } from "@/components/tickets/ticket-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTicket, getTickets } from "@/lib/tickets";
import {
  TICKET_AREAS,
  TICKET_CATEGORIES,
  type Ticket,
  type TicketArea,
  type TicketCategory,
  type TicketStatus
} from "@/types/ticket";

const statusOrder: TicketStatus[] = ["ABIERTO", "EN PROCESO", "RESUELTO"];

export function UserDashboard() {
  const { user } = useSessionGuard(["USUARIO"]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [area, setArea] = useState<TicketArea | undefined>();
  const [category, setCategory] = useState<TicketCategory | undefined>();
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setTickets(
      getTickets()
        .filter((ticket) => ticket.userId === user.id)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    );
  }, [user]);

  const metrics = useMemo(() => {
    return statusOrder.map((status) => ({
      status,
      count: tickets.filter((ticket) => ticket.status === status).length
    }));
  }, [tickets]);

  function resetForm() {
    setArea(undefined);
    setCategory(undefined);
    setDescription("");
    setFormError("");
  }

  function handleCreateTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!user || !area || !category || description.trim().length < 6) {
      setFormError("Completá el área, el motivo y una descripción del problema.");
      return;
    }

    const ticket = createTicket(
      {
        area,
        category,
        description
      },
      user
    );

    setTickets((currentTickets) => [ticket, ...currentTickets]);
    resetForm();
  }

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <AppShell
      description="Creá solicitudes y consultá el historial de tus tickets."
      mode="user"
      title="Dashboard del usuario"
      user={user}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <section className="space-y-4" id="nuevo-ticket">
          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                className="rounded-lg border bg-card p-4 shadow-sm"
                key={metric.status}
              >
                <p className="text-xs font-semibold text-muted-foreground">
                  {metric.status}
                </p>
                <p className="mt-2 text-2xl font-semibold">{metric.count}</p>
              </div>
            ))}
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TicketPlus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Crear ticket</CardTitle>
                  <CardDescription>
                    Reportá el problema para que administración pueda gestionarlo.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateTicket}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Área donde está el problema</Label>
                    <Select
                      onValueChange={(value) => setArea(value as TicketArea)}
                      value={area}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_AREAS.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Motivo / problema</Label>
                    <Select
                      onValueChange={(value) =>
                        setCategory(value as TicketCategory)
                      }
                      value={category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_CATEGORIES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del problema</Label>
                  <Textarea
                    id="description"
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describí qué ocurre, desde cuándo y cualquier detalle útil."
                    value={description}
                  />
                </div>

                {formError ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </p>
                ) : null}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button onClick={resetForm} type="button" variant="outline">
                    <RotateCcw className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Plus className="h-4 w-4" />
                    Crear ticket
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4" id="mis-tickets">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ClipboardList className="h-5 w-5 text-primary" />
                Mis tickets
              </h2>
              <p className="text-sm text-muted-foreground">
                Solo se muestran solicitudes asociadas a tu usuario.
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium sm:flex">
              <ListChecks className="h-4 w-4 text-primary" />
              {tickets.length}
            </div>
          </div>

          {tickets.length > 0 ? (
            <div className="grid gap-3">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
              <TicketPlus className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">Todavía no hay tickets</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando crees uno, aparecerá en este historial.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
