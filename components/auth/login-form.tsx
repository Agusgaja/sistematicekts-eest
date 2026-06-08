"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { authenticate, getSession, roleHomePath, saveSession } from "@/lib/auth";
import { SchoolShieldIcon } from "@/components/layout/school-shield-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      return;
    }

    router.replace(roleHomePath(session.rol));
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const user = authenticate(identifier, password);

    if (!user) {
      setIsSubmitting(false);
      setError("Credenciales inválidas. Revisa el usuario y la contraseña.");
      return;
    }

    saveSession(user);
    router.push(roleHomePath(user.rol));
  }

  return (
    <main className="soft-grid flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <section className="hidden lg:block">
          <div className="mb-8 inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            Sistema de tickets EEST Nº 1
          </div>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-foreground">
            Gestión simple para tickets de soporte y mantenimiento.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            Organiza, prioriza y resuelve incidencias de manera eficiente con nuestro sistema de tickets diseñado para la EEST Nº 1.
          </p>

          
        </section>

        <Card className="mx-auto w-full max-w-md shadow-soft">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <SchoolShieldIcon className="h-6 w-6" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Acceso mock
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
              <CardDescription className="mt-2">
                Ingresá con un usuario demo para continuar.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="identifier">Email o usuario</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="username"
                    className="pl-9"
                    id="identifier"
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="admin@test.com"
                    required
                    value={identifier}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="current-password"
                    className="pl-9"
                    id="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="123456"
                    required
                    type="password"
                    value={password}
                  />
                </div>
              </div>

              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <Button className="w-full" disabled={isSubmitting} type="submit">
                Iniciar sesión
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-5 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Usuarios demo</p>
              <p className="mt-1">admin@test.com / 123456</p>
              <p>tecnico@test.com / 123456</p>
              <p>usuario@test.com / 123456</p>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link className="font-medium text-primary hover:underline" href="/register">
                Registrarse
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
