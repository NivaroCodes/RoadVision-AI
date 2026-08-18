export type Severity = "critical" | "high" | "medium" | "low";

export const severityLabel: Record<Severity, string> = {
  critical: "Критическая",
  high: "Высокая",
  medium: "Средняя",
  low: "Низкая",
};

export const severityClasses: Record<
  Severity,
  { dot: string; text: string; chip: string; border: string; bg: string }
> = {
  critical: {
    dot: "bg-critical",
    text: "text-critical",
    chip: "bg-critical/12 text-critical",
    border: "border-critical",
    bg: "bg-critical",
  },
  high: {
    dot: "bg-high",
    text: "text-high",
    chip: "bg-high/12 text-high",
    border: "border-high",
    bg: "bg-high",
  },
  medium: {
    dot: "bg-medium",
    text: "text-medium",
    chip: "bg-medium/12 text-medium",
    border: "border-medium",
    bg: "bg-medium",
  },
  low: {
    dot: "bg-low",
    text: "text-low",
    chip: "bg-low/12 text-low",
    border: "border-low",
    bg: "bg-low",
  },
};

export type DefectStatus = "submitted" | "detected" | "in_progress" | "fixed" | "resolved" | "verified" | "rejected";

export const statusLabel: Record<string, string> = {
  submitted: "Ожидает анализа",
  detected: "Обнаружено",
  in_progress: "В работе",
  fixed: "Устранено",
  resolved: "Устранено",
  verified: "Проверено",
  rejected: "Отклонено",
};

export const statusChip: Record<string, string> = {
  submitted: "bg-muted text-muted-foreground",
  detected: "bg-low/12 text-low",
  in_progress: "bg-medium/12 text-medium",
  fixed: "bg-primary/12 text-primary",
  resolved: "bg-primary/12 text-primary",
  verified: "bg-primary/12 text-primary",
  rejected: "bg-destructive/12 text-destructive",
};

export const trendData = [
  { day: "Пн", detections: 38, critical: 4 },
  { day: "Вт", detections: 52, critical: 6 },
  { day: "Ср", detections: 44, critical: 5 },
  { day: "Чт", detections: 61, critical: 8 },
  { day: "Пт", detections: 74, critical: 7 },
  { day: "Сб", detections: 46, critical: 3 },
  { day: "Вс", detections: 58, critical: 4 },
];

export const notifications = [
  {
    id: "n1",
    title: "37 критических дефектов ждут решения",
    body: "Превышен порог на пр. Тауке хана.",
    ago: "2 мин назад",
    severity: "critical" as Severity,
    unread: true,
  },
  {
    id: "n2",
    title: "Сканирование #4821 завершено",
    body: "Обработано 148 км · 62 новых дефекта.",
    ago: "24 мин назад",
    severity: "low" as Severity,
    unread: true,
  },
  {
    id: "n3",
    title: "Точность модели v4.2 выросла на 0,6%",
    body: "Точность валидации — 96,8%.",
    ago: "1 ч назад",
    severity: "medium" as Severity,
    unread: true,
  },
  {
    id: "n4",
    title: "Назначена ремонтная бригада",
    body: "Ремонт участка SEG-0871 — 19 августа.",
    ago: "3 ч назад",
    severity: "high" as Severity,
    unread: false,
  },
];

export const dateRanges = [
  "1 день",
  "7 дней",
  "30 дней",
  "12 месяцев",
  "Весь период",
];
