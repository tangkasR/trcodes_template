"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

const KEY = "sidebar-collapsed";
const EVENT = "sidebar-collapsed-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

type SidebarValue = {
  collapsed: boolean; // lebar sidebar di desktop
  toggleCollapsed: () => void;
  mobileOpen: boolean; // drawer di layar kecil
  openMobile: () => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    try {
      localStorage.setItem(KEY, getSnapshot() ? "0" : "1");
    } catch {
      // localStorage tidak tersedia: abaikan, state tidak tersimpan
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const value = useMemo<SidebarValue>(
    () => ({
      collapsed,
      toggleCollapsed,
      mobileOpen,
      openMobile: () => setMobileOpen(true),
      closeMobile: () => setMobileOpen(false),
    }),
    [collapsed, toggleCollapsed, mobileOpen]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx)
    throw new Error("useSidebar harus dipakai di dalam SidebarProvider");
  return ctx;
}
