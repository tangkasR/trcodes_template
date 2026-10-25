"use client";

import { createContext, useContext, useMemo } from "react";
import type { Action, FeatureKey, PermissionMap } from "@/common/constants/rbac.constant";

type CurrentUser = {
  name: string;
  email: string;
  photo?: string | null;
  roleName: string;
  mfaRequired?: boolean;
};

type PermissionValue = {
  user: CurrentUser;
  permissions: PermissionMap;
  can: (feature: FeatureKey, action: Action) => boolean;
  mfaRequired: boolean;
};

const PermissionContext = createContext<PermissionValue | null>(null);

export function PermissionProvider({
  user,
  permissions,
  children,
}: {
  user: CurrentUser;
  permissions: PermissionMap;
  children: React.ReactNode;
}) {
  const value = useMemo<PermissionValue>(
    () => ({
      user,
      permissions,
      can: (feature, action) => permissions[feature]?.includes(action) ?? false,
      mfaRequired: !!user.mfaRequired,
    }),
    [user, permissions]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  const ctx = useContext(PermissionContext);
  if (!ctx)
    throw new Error("usePermission harus dipakai di dalam PermissionProvider");
  return ctx;
}
