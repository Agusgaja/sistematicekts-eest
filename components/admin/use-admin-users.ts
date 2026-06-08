"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { roleHomePath, saveSession } from "@/lib/auth";
import { getUsers, toSafeUser, updateUserRole } from "@/lib/users";
import type { User, UserRole } from "@/types/user";
import { useSessionGuard } from "@/components/auth/use-session-guard";

function sortUsers(users: User[]) {
  return [...users].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

export function useAdminUsers() {
  const router = useRouter();
  const { user } = useSessionGuard(["ADMIN"]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setUsers(sortUsers(getUsers()));
  }, [user]);

  function refreshUsers() {
    setUsers(sortUsers(getUsers()));
  }

  function handleRoleChange(userId: number, nextRole: UserRole) {
    if (!user) {
      return;
    }

    const result = updateUserRole({
      userId,
      nextRole,
      currentUserId: user.id
    });

    const sortedUsers = sortUsers(result.users);
    setUsers(sortedUsers);

    if (result.updatedUser.id === user.id) {
      const safeUser = toSafeUser(result.updatedUser);
      saveSession(safeUser);
      router.replace(roleHomePath(result.updatedUser.rol));
    }

    return result.updatedUser;
  }

  return {
    user,
    users,
    refreshUsers,
    handleRoleChange
  };
}
