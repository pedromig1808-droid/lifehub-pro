export type Priority = "baixa" | "media" | "alta";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  done: boolean;
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  notes?: string;
  remind: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  targetHours: number;
  loggedMinutes: number;
  checklist: ChecklistItem[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export type TxType = "receita" | "despesa";

export interface Transaction {
  id: string;
  type: TxType;
  description: string;
  category: string;
  amount: number; // sempre positivo
  date: string; // YYYY-MM-DD
}

export interface FinanceGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline?: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  /** datas concluídas no formato YYYY-MM-DD */
  log: string[];
}

export interface Goal {
  id: string;
  title: string;
  deadline?: string;
  progress: number; // 0..100
  notes?: string;
}

export type NotifKey = "tasks" | "calendar" | "habits" | "studies" | "finance";

export interface Settings {
  theme: "light" | "dark";
  userName: string;
  notifications: Record<NotifKey, boolean>;
  dailyReminder: { enabled: boolean; time: string }; // resumo diário
  weeklyReminder: { enabled: boolean; weekday: number; time: string }; // 0=Dom
  dashboardWidgets: Record<string, boolean>;
}

export interface AppState {
  tasks: Task[];
  events: CalendarEvent[];
  subjects: Subject[];
  notes: Note[];
  transactions: Transaction[];
  financeGoals: FinanceGoal[];
  habits: Habit[];
  goals: Goal[];
  settings: Settings;
}

export type View =
  | "dashboard"
  | "tasks"
  | "calendar"
  | "studies"
  | "notes"
  | "finance"
  | "habits"
  | "goals"
  | "settings";

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  userName: "",
  notifications: { tasks: true, calendar: true, habits: true, studies: false, finance: false },
  dailyReminder: { enabled: false, time: "09:00" },
  weeklyReminder: { enabled: false, weekday: 1, time: "09:00" },
  dashboardWidgets: { tasks: true, events: true, habits: true, finance: true, goals: true, studies: true },
};

export const EMPTY_STATE: AppState = {
  tasks: [],
  events: [],
  subjects: [],
  notes: [],
  transactions: [],
  financeGoals: [],
  habits: [],
  goals: [],
  settings: DEFAULT_SETTINGS,
};
