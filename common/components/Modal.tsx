// src/components/Modal.tsx
"use client";

import { useEffect, useId } from "react";
import { X, type LucideIcon } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onClose: () => void;
  children: React.ReactNode;
  closeDisabled?: boolean;
  maxWidth?: string;
  footer?: React.ReactNode;
};

export default function Modal({
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
  closeDisabled,
  maxWidth = "max-w-lg",
  footer,
}: Props) {
  const titleUuid = useId();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape" || closeDisabled) return;
      if (document.querySelector(".swal2-container")) return;
      onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, closeDisabled]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3.5 sm:p-4 backdrop-blur-md transition-all duration-200 animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !closeDisabled) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleUuid}
        className={`relative flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-950/25 ring-1 ring-slate-900/5 duration-200 ease-out animate-in zoom-in-95`}
      >
        {/* Sticky Header with Backdrop Blur */}
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="flex size-10.5 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10 text-blue-600 ring-1 ring-blue-500/20 shadow-2xs">
                <Icon className="size-5" />
              </span>
            )}
            <div>
              <h2
                id={titleUuid}
                className="text-base sm:text-lg font-bold tracking-tight text-slate-900"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-xs text-slate-500 font-normal leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 select-none">
              ESC
            </span>
            <button
              type="button"
              onClick={onClose}
              disabled={closeDisabled}
              className="flex size-8.5 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Tutup modal"
              title="Tutup (Esc)"
            >
              <X className="size-4.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {/* Optional Sticky Action Footer */}
        {footer && (
          <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-3.5 backdrop-blur-xs flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
