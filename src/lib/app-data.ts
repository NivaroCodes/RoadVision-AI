import type { Severity } from "./roadvision-data";

export type DefectStatus = "detected" | "in_progress" | "resolved";

export const statusLabel: Record<DefectStatus, string> = {
  detected: "Обнаружено",
  in_progress: "В работе",
  resolved: "Устранено",
};

export const statusChip: Record<DefectStatus, string> = {
  detected: "bg-low/12 text-low",
  in_progress: "bg-medium/12 text-medium",
  resolved: "bg-primary/12 text-primary",
};

export type DefectRow = {
  id: string;
  priority: string;
  type: string;
  severity: Severity;
  status: DefectStatus;
  confidence: number;
  address: string;
  detectedAt: string;
};

export const defectRows: DefectRow[] = [
  {
    id: "#1",
    priority: "Medium",
    type: "Яма",
    severity: "medium",
    status: "detected",
    confidence: 80,
    address: "пр. Тауке хана, 24",
    detectedAt: "17.08.2026 · 23:58",
  },
  {
    id: "#2",
    priority: "High",
    type: "Продольная трещина",
    severity: "high",
    status: "in_progress",
    confidence: 94,
    address: "ул. Байтурсынова, 112",
    detectedAt: "17.08.2026 · 21:14",
  },
  {
    id: "#3",
    priority: "Critical",
    type: "Провал покрытия",
    severity: "critical",
    status: "detected",
    confidence: 97,
    address: "ул. Жибек Жолы, 8",
    detectedAt: "17.08.2026 · 18:02",
  },
  {
    id: "#4",
    priority: "Low",
    type: "Стёртая разметка",
    severity: "low",
    status: "resolved",
    confidence: 88,
    address: "пр. Кунаева, 51",
    detectedAt: "16.08.2026 · 12:40",
  },
  {
    id: "#5",
    priority: "Medium",
    type: "Колейность",
    severity: "medium",
    status: "in_progress",
    confidence: 91,
    address: "ул. Рыскулова, 3",
    detectedAt: "16.08.2026 · 09:26",
  },
];

export const defectTypes = ["Все типы", "Яма", "Трещина", "Разметка", "Колейность"];
export const confidenceOptions = ["Любая", "≥ 70%", "≥ 85%", "≥ 95%"];
export const severityOptions = ["Любая критичность", "Низкая", "Средняя", "Высокая", "Критическая"];
export const statusOptions = ["Все статусы", "Обнаружено", "В работе", "Устранено"];

export type AppRole = "Администратор" | "Дорожная служба" | "Житель";

export const roleOptions: AppRole[] = ["Администратор", "Дорожная служба", "Житель"];

export type AppUser = {
  id: number;
  email: string;
  role: AppRole;
  active: boolean;
};

export const appUsers: AppUser[] = [
  { id: 12, email: "stopper.milman12@gmail.com", role: "Дорожная служба", active: true },
  { id: 5, email: "admin.qa@example.com", role: "Администратор", active: true },
  { id: 6, email: "road.qa@example.com", role: "Дорожная служба", active: true },
  { id: 7, email: "resident.qa@example.com", role: "Житель", active: true },
  { id: 4, email: "browser.resident.qa@example.com", role: "Житель", active: true },
];

export const adminUser = {
  email: "admin.qa@example.com",
  role: "Администратор",
  initials: "A",
};
