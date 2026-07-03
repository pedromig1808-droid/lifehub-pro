import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, EMPTY_STATE, DEFAULT_SETTINGS, Settings } from "./types";
import { loadState, saveState, clearState } from "./db";
import { startScheduler } from "./notifications";

interface Store {
  state: AppState;
  ready: boolean;
  /** Atualiza uma fatia do estado de forma imutável. */
  update: <K extends keyof AppState>(key: K, updater: (prev: AppState[K]) => AppState[K]) => void;
  setSettings: (patch: Partial<Settings>) => void;
  exportJSON: () => void;
  importJSON: (file: File) => Promise<boolean>;
  resetAll: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Carrega do IndexedDB uma única vez
  useEffect(() => {
    loadState<AppState>().then((saved) => {
      if (saved) {
        setState({
          ...EMPTY_STATE,
          ...saved,
          settings: { ...DEFAULT_SETTINGS, ...saved.settings },
        });
      }
      setReady(true);
    });
  }, []);

  // Persiste com debounce
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => saveState(state), 300);
    return () => clearTimeout(t);
  }, [state, ready]);

  // Aplica o tema
  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.settings.theme === "dark");
  }, [state.settings.theme]);

  // Agendador de notificações (roda enquanto o app está aberto)
  useEffect(() => {
    if (!ready) return;
    return startScheduler(() => stateRef.current);
  }, [ready]);

  const update: Store["update"] = (key, updater) =>
    setState((prev) => ({ ...prev, [key]: updater(prev[key]) }));

  const setSettings = (patch: Partial<Settings>) =>
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(stateRef.current, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifehub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Partial<AppState>;
      if (typeof data !== "object" || data === null || !Array.isArray(data.tasks)) return false;
      setState({
        ...EMPTY_STATE,
        ...data,
        settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
      } as AppState);
      return true;
    } catch {
      return false;
    }
  };

  const resetAll = async () => {
    await clearState();
    setState(EMPTY_STATE);
  };

  return (
    <Ctx.Provider value={{ state, ready, update, setSettings, exportJSON, importJSON, resetAll }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore deve ser usado dentro de <StoreProvider>");
  return ctx;
}
