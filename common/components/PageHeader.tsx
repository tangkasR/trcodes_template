import { Package, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  desc?: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  icon: Icon = Package,
  title,
  description,
  desc,
  eyebrow = "Dashboard",
  actions,
}: Props) {
  const displayDescription = description ?? desc;
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-200/50 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">
            {eyebrow}
          </p>
          <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {displayDescription && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {displayDescription}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </section>
  );
}
