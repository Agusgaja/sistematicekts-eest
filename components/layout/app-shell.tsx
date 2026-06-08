"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  ShieldCheck,
  TicketCheck,
  Users,
  UserCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { clearSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { SafeUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SchoolShieldIcon } from "@/components/layout/school-shield-icon";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match: "exact" | "startsWith" | "none";
};

type AppShellProps = {
  user: SafeUser;
  title: string;
  description: string;
  mode: "admin" | "tecnico" | "user";
  children: ReactNode;
  actions?: ReactNode;
};

export function AppShell({
  user,
  title,
  description,
  mode,
  children,
  actions
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  const navItems: NavItem[] =
    mode === "admin"
      ? [
          {
            label: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
            match: "exact"
          },
          {
            label: "Tickets",
            href: "/admin/tickets",
            icon: ClipboardList,
            match: "startsWith"
          },
          {
            label: "Usuarios",
            href: "/admin/users",
            icon: Users,
            match: "startsWith"
          },
          {
            label: "Registro",
            href: "/admin/registro",
            icon: Archive,
            match: "startsWith"
          }
        ]
      : mode === "tecnico"
        ? [
            {
              label: "Inicio",
              href: "/tecnico",
              icon: LayoutDashboard,
              match: "exact"
            },
            {
              label: "Tickets asignados",
              href: "/tecnico#asignados",
              icon: ClipboardList,
              match: "none"
            },
            {
              label: "Historial",
              href: "/tecnico#historial",
              icon: CalendarClock,
              match: "none"
            },
            {
              label: "Mis resueltos",
              href: "/tecnico/resueltos",
              icon: TicketCheck,
              match: "startsWith"
            }
          ]
        : [
            {
              label: "Mis tickets",
              href: "/dashboard",
              icon: ClipboardList,
              match: "exact"
            },
            {
              label: "Nuevo ticket",
              href: "/dashboard#nuevo-ticket",
              icon: TicketCheck,
              match: "none"
            },
            {
              label: "Historial",
              href: "/dashboard#mis-tickets",
              icon: UserCircle,
              match: "none"
            }
          ];

  function isActive(item: NavItem) {
    const hrefPath = item.href.split("#")[0];

    if (item.match === "none") {
      return false;
    }

    if (item.match === "exact") {
      return pathname === hrefPath;
    }

    return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  }

  function renderNavItem(item: NavItem) {
    const Icon = item.icon;
    const active = isActive(item);

    return (
      <Link
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          active && "bg-accent text-foreground"
        )}
        href={item.href}
        key={item.label}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card/95 lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <SchoolShieldIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Tickets</p>
            <p className="text-xs text-muted-foreground">Soporte y mantenimiento</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">{navItems.map((item) => renderNavItem(item))}</nav>

        <div className="border-t p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg border bg-background px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              className="flex-1 justify-start"
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-background/88 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card lg:hidden">
                <PanelLeft className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold leading-tight sm:text-2xl">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {actions}
              <Button className="lg:hidden" variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b bg-background px-4 py-2 scrollbar-clean lg:hidden">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
