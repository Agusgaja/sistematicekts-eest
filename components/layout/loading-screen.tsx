import { SchoolShieldIcon } from "@/components/layout/school-shield-icon";

export function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <SchoolShieldIcon className="h-5 w-5 animate-pulse" />
        Cargando panel...
      </div>
    </main>
  );
}
