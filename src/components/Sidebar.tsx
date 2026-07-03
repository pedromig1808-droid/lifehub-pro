import type { ReactNode } from "react";
import type { View } from "../types";
import {
  IconHome, IconTasks, IconCalendar, IconBook, IconNote,
  IconWallet, IconFlame, IconTarget, IconGear, IconChevronLeft, IconX,
} from "./Icons";

export interface NavItem {
  view: View;
  label: string;
  icon: ReactNode;
  /** cor de acento do módulo (assinatura visual do LifeHub) */
  tint: string;
  activeBg: string;
}

export const NAV: NavItem[] = [
  { view: "dashboard", label: "Dashboard",  icon: <IconHome className="w-5 h-5" />,     tint: "text-indigo-500",  activeBg: "bg-indigo-500/10" },
  { view: "tasks",     label: "Tarefas",    icon: <IconTasks className="w-5 h-5" />,    tint: "text-blue-500",    activeBg: "bg-blue-500/10" },
  { view: "calendar",  label: "Calendário", icon: <IconCalendar className="w-5 h-5" />, tint: "text-violet-500",  activeBg: "bg-violet-500/10" },
  { view: "studies",   label: "Estudos",    icon: <IconBook className="w-5 h-5" />,     tint: "text-cyan-500",    activeBg: "bg-cyan-500/10" },
  { view: "notes",     label: "Notas",      icon: <IconNote className="w-5 h-5" />,     tint: "text-amber-500",   activeBg: "bg-amber-500/10" },
  { view: "finance",   label: "Finanças",   icon: <IconWallet className="w-5 h-5" />,   tint: "text-emerald-500", activeBg: "bg-emerald-500/10" },
  { view: "habits",    label: "Hábitos",    icon: <IconFlame className="w-5 h-5" />,    tint: "text-rose-500",    activeBg: "bg-rose-500/10" },
  { view: "goals",     label: "Objetivos",  icon: <IconTarget className="w-5 h-5" />,   tint: "text-orange-500",  activeBg: "bg-orange-500/10" },
  { view: "settings",  label: "Ajustes",    icon: <IconGear className="w-5 h-5" />,     tint: "text-zinc-500",    activeBg: "bg-zinc-500/10" },
];

export default function Sidebar({
  view,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  view: View;
  onNavigate: (v: View) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const content = (
    <div className="flex flex-col h-full">
      {/* Marca */}
      <div className={`flex items-center gap-2.5 px-4 h-16 shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="grid grid-cols-2 gap-[3px] w-7 h-7 shrink-0">
          <span className="rounded-[5px] bg-blue-500" />
          <span className="rounded-[5px] bg-emerald-500" />
          <span className="rounded-[5px] bg-rose-500" />
          <span className="rounded-[5px] bg-amber-500" />
        </div>
        {!collapsed && (
          <span className="font-semibold tracking-tight text-[15px]">
            LifeHub <span className="text-zinc-400 font-normal">Pro</span>
          </span>
        )}
        <button
          className="btn-ghost !p-1.5 !rounded-lg ml-auto lg:hidden"
          onClick={onCloseMobile}
          aria-label="Fechar menu"
        >
          <IconX className="w-4 h-4" />
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-2.5 space-y-1 overflow-y-auto scroll-thin py-2">
        {NAV.map((item) => {
          const active = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => {
                onNavigate(item.view);
                onCloseMobile();
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                ${collapsed ? "justify-center px-0" : ""}
                ${active
                  ? `${item.activeBg} ${item.tint}`
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-100"}`}
              aria-current={active ? "page" : undefined}
            >
              <span className={active ? item.tint : ""}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && (
                <span className={`ml-auto w-1.5 h-1.5 rounded-full bg-current ${item.tint}`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Recolher (desktop) */}
      <div className="p-2.5 hidden lg:block">
        <button
          onClick={onToggleCollapse}
          className="btn-ghost w-full !justify-center"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <IconChevronLeft className={`w-5 h-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && <span className="text-xs">Recolher</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 border-r border-zinc-200/80 dark:border-white/[0.07]
          bg-surface-light dark:bg-surface-dark transition-[width] duration-300 ${collapsed ? "w-[76px]" : "w-64"}`}
      >
        {content}
      </aside>

      {/* Mobile: drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-surface-light dark:bg-surface-dark border-r border-zinc-200 dark:border-white/[0.07] animate-fadeUp">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
