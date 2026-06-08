"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getSession, roleHomePath } from "@/lib/auth";
import type { SafeUser, UserRole } from "@/types/user";

export function useSessionGuard(allowedRoles: readonly UserRole[]) {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  const allowedRolesKey = useMemo(
    () => allowedRoles.slice().sort().join("|"),
    [allowedRoles]
  );
  const allowedRolesSet = useMemo(
    () => new Set(allowedRoles),
    [allowedRolesKey]
  );

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (!allowedRolesSet.has(session.rol)) {
      router.replace(roleHomePath(session.rol));
      return;
    }

    setUser(session);
  }, [allowedRolesKey, allowedRolesSet, router]);

  return { user };
}
