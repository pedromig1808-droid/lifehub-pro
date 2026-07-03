import { useEffect, useState } from "react";
import type { View } from "./types";
import { useStore } from "./store";
import Sidebar from "./components/Sidebar";
import { IconMenu, IconSun, IconMoon, IconDownload } from "./components/Icons";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Studies from "./pages/Studies";
import Notes from "./pages/Notes";
import Finance from "./pages/Finance";
import Habits from "./pages/Habits";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";

/** Evento de instalação do PWA (Chrome/Edge/Android) */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export default function App() {
  const { state, ready, setSettings } = useStore();
  const [view, setView] = useState<View>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="grid grid-cols-2 gap-1 w-10 h-10 animate-pulse">
          <span className="rounded-md bg-blue-500" />
          <span className="rounded-md bg-emerald-500" />
          <span className="rounded-md bg-rose-500" />
          <span className="rounded-md bg-amber-500" />
        </div>
      </div>
    );
  }

  const dark = state.settings.theme === "dark";

  const pages: Record<View, JSX.Element> = {
    dashboard: <Dashboard onNavigate={setView} />,
    tasks: <Tasks />,
    calendar: <Calendar />,
    studies: <Studies />,
    notes: <Notes />,
    finance: <Finance />,
    habits: <Habits />,
    goals: <Goals />,
    settings: <Settings />,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        view={view}
        onNavigate={setView}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-2 px-4 sm:px-6 border-b border-zinc-200/80 dark:border-white/[0.07] bg-canvas-light/80 dark:bg-canvas-dark/80 backdrop-blur-xl">
          <button className="btn-ghost !p-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <IconMenu className="w-5 h-5" />
          </button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            {installEvt && (
              <button
                className="btn-ghost text-xs !py-1.5"
                onClick={async () => {
                  await installEvt.prompt();
                  setInstallEvt(null);
                }}
              >
                <IconDownload className="w-4 h-4" /> Instalar app
              </button>
            )}
            <button
              className="btn-ghost !p-2"
              onClick={() => setSettings({ theme: dark ? "light" : "dark" })}
              aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              {dark ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl w-full mx-auto">
          <div key={view} className="animate-fadeUp">
            {pages[view]}
          </div>
        </main>
      </div>
    </div>
  );
}
