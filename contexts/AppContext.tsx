"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import MeService from "@/services/auth/MeService";
import type { MeUser, MeRole, MePermission } from "@/services/auth/MeService";

type PermissionAction = "isRead" | "isAdd" | "isEdit" | "isDelete";

interface AppContextType {
  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;

  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;

  // Authentication data
  user: MeUser | null;
  role: MeRole | null;
  permissions: MePermission[];
  authLoading: boolean;
  refreshMe: () => Promise<void>;

  // Permission checker
  hasPermission: (featureCode: string, action: PermissionAction) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [user, setUser] = useState<MeUser | null>(null);
  const [role, setRole] = useState<MeRole | null>(null);
  const [permissions, setPermissions] = useState<MePermission[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    setAuthLoading(true);

    try {
      const response = await MeService.getMe();

      if (!response.data) {
        throw new Error("Data autentikasi tidak ditemukan.");
      }

      setUser(response.data.user);
      setRole(response.data.role);
      setPermissions(response.data.permissions);
    } catch (error) {
      setUser(null);
      setRole(null);
      setPermissions([]);

      console.error(
        "Gagal mengambil data autentikasi:",
        error instanceof Error ? error.message : error
      );
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  // Cek permission berdasarkan feature code dan action
  const hasPermission = useCallback(
    (featureCode: string, action: PermissionAction): boolean => {
      const permission = permissions.find(
        (item) => item.featureCode.toUpperCase() === featureCode.toUpperCase()
      );

      return permission?.[action] ?? false;
    },
    [permissions]
  );

  return (
    <AppContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen,

        user,
        role,
        permissions,
        authLoading,
        refreshMe,
        hasPermission,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
};
