"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Mail, UserPlus } from "lucide-react";

import { getSession, roleHomePath, saveSession } from "@/lib/auth";
import { registerUser } from "@/lib/users";
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

export function RegisterForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (!nombre.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Completá todos los campos para registrarte.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = registerUser({
        nombre,
        email,
        password
      });

      saveSession({
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        createdAt: newUser.createdAt
      });
      setSuccess("Tu cuenta fue creada correctamente.");
      router.push(roleHomePath(newUser.rol));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="soft-grid flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="mx-auto w-full max-w-md shadow-soft">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <SchoolShieldIcon className="h-11 w-11" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
              <UserPlus className="h-3.5 w-3.5 text-primary" />
              Alta de usuario
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Crear cuenta</CardTitle>
            <CardDescription className="mt-2">
              El usuario quedará creado con rol USUARIO.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre y apellido</Label>
              <div className="relative">
                <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="name"
                  className="pl-9"
                  id="nombre"
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="Nombre completo"
                  required
                  value={nombre}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="email"
                  className="pl-9"
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tuemail@dominio.com"
                  required
                  type="email"
                  value={email}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="new-password"
                  className="pl-9"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  type="password"
                  value={password}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="new-password"
                  className="pl-9"
                  id="confirmPassword"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repetir contraseña"
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              Registrarme
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link className="font-medium text-primary hover:underline" href="/login">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
