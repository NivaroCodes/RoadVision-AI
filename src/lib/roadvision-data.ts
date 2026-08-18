import pothole from "@/assets/detection-pothole.jpg";
import crack from "@/assets/detection-crack.jpg";
import marking from "@/assets/detection-marking.jpg";
import rutting from "@/assets/detection-rutting.jpg";

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

export type BBox = {
  id: string;
  label: string;
  confidence: number;
  severity: Severity;
  /** percentages of the frame */
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Detection = {
  id: string;
  code: string;
  type: string;
  severity: Severity;
  confidence: number;
  road: string;
  segment: string;
  coordinates: string;
  detectedAt: string;
  ago: string;
  area: string;
  depth: string;
  priority: string;
  image: string;
  boxes: BBox[];
};

export const detections: Detection[] = [
  {
    id: "det-1",
    code: "DET-40912",
    type: "Скопление ям",
    severity: "critical",
    confidence: 98.4,
    road: "I-95 Northbound",
    segment: "SEG-1042",
    coordinates: "40.7128° N, 74.0060° W",
    detectedAt: "Aug 17, 2026 · 14:32",
    ago: "2 мин назад",
    area: "1.84 m²",
    depth: "72 mm",
    priority: "P1 — Dispatch crew",
    image: pothole,
    boxes: [
      {
        id: "b1",
        label: "Яма",
        confidence: 98.4,
        severity: "critical",
        x: 23,
        y: 21,
        w: 52,
        h: 55,
      },
      {
        id: "b2",
        label: "Edge crack",
        confidence: 87.1,
        severity: "medium",
        x: 66,
        y: 38,
        w: 26,
        h: 42,
      },
      {
        id: "b3",
        label: "Hairline crack",
        confidence: 79.6,
        severity: "low",
        x: 40,
        y: 7,
        w: 14,
        h: 22,
      },
    ],
  },
  {
    id: "det-2",
    code: "DET-40908",
    type: "Продольная трещина",
    severity: "high",
    confidence: 94.2,
    road: "SR-27 Eastbound",
    segment: "SEG-0871",
    coordinates: "40.7412° N, 73.9896° W",
    detectedAt: "Aug 17, 2026 · 14:18",
    ago: "16 min ago",
    area: "3.42 m²",
    depth: "28 mm",
    priority: "P2 — Schedule repair",
    image: crack,
    boxes: [
      {
        id: "b1",
        label: "Продольная трещина",
        confidence: 94.2,
        severity: "high",
        x: 40,
        y: 33,
        w: 24,
        h: 48,
      },
      {
        id: "b2",
        label: "Surface fatigue",
        confidence: 81.5,
        severity: "medium",
        x: 8,
        y: 52,
        w: 28,
        h: 24,
      },
      {
        id: "b3",
        label: "Shoulder crack",
        confidence: 76.3,
        severity: "low",
        x: 72,
        y: 46,
        w: 22,
        h: 26,
      },
    ],
  },
  {
    id: "det-3",
    code: "DET-40901",
    type: "Стёртая разметка",
    severity: "medium",
    confidence: 91.7,
    road: "Maple Ave",
    segment: "SEG-0455",
    coordinates: "40.7602° N, 73.9712° W",
    detectedAt: "Aug 17, 2026 · 13:57",
    ago: "37 min ago",
    area: "6.10 m²",
    depth: "—",
    priority: "P3 — Repaint queue",
    image: marking,
    boxes: [
      {
        id: "b1",
        label: "Faded crosswalk",
        confidence: 91.7,
        severity: "medium",
        x: 26,
        y: 53,
        w: 40,
        h: 15,
      },
      {
        id: "b2",
        label: "Patch repair",
        confidence: 84.9,
        severity: "low",
        x: 36,
        y: 60,
        w: 26,
        h: 12,
      },
    ],
  },
  {
    id: "det-4",
    code: "DET-40894",
    type: "Колейность обочины",
    severity: "high",
    confidence: 89.3,
    road: "Harbor Blvd",
    segment: "SEG-0318",
    coordinates: "40.7031° N, 74.0165° W",
    detectedAt: "Aug 17, 2026 · 13:41",
    ago: "53 min ago",
    area: "2.27 m²",
    depth: "41 mm",
    priority: "P2 — Schedule repair",
    image: rutting,
    boxes: [
      {
        id: "b1",
        label: "Broken shoulder",
        confidence: 89.3,
        severity: "high",
        x: 60,
        y: 28,
        w: 32,
        h: 34,
      },
      {
        id: "b2",
        label: "Joint separation",
        confidence: 82.4,
        severity: "medium",
        x: 30,
        y: 52,
        w: 26,
        h: 20,
      },
    ],
  },
];

export type RecentDetection = {
  id: string;
  type: string;
  road: string;
  severity: Severity;
  confidence: number;
  ago: string;
};

export const recentDetections: RecentDetection[] = [
  { id: "DET-40912", type: "Скопление ям", road: "пр. Тауке хана · км 4.2", severity: "critical", confidence: 98.4, ago: "2m" },
  { id: "DET-40908", type: "Продольная трещина", road: "ул. Байтурсынова · км 1.8", severity: "high", confidence: 94.2, ago: "16m" },
  { id: "DET-40901", type: "Стёртая разметка", road: "пр. Кунаева · км 3.2", severity: "medium", confidence: 91.7, ago: "37m" },
  { id: "DET-40894", type: "Колейность обочины", road: "ул. Рыскулова · км 0.9", severity: "high", confidence: 89.3, ago: "53m" },
  { id: "DET-40887", type: "Сетка трещин", road: "ул. Жибек Жолы · км 2.7", severity: "critical", confidence: 96.1, ago: "1h" },
  { id: "DET-40881", type: "Просадка люка", road: "ул. Алдиярова · км 1.1", severity: "low", confidence: 88.5, ago: "1h" },
  { id: "DET-40874", type: "Разрушение кромки", road: "пр. Абая · км 3.3", severity: "medium", confidence: 90.8, ago: "2h" },
  { id: "DET-40868", type: "Яма", road: "ул. Дулати · км 6.4", severity: "high", confidence: 93.4, ago: "2h" },
];

export const severityBreakdown: { severity: Severity; value: number }[] = [
  { severity: "critical", value: 37 },
  { severity: "high", value: 86 },
  { severity: "medium", value: 124 },
  { severity: "low", value: 77 },
];

export const trendData = [
  { day: "Пн", detections: 38, critical: 4 },
  { day: "Вт", detections: 52, critical: 6 },
  { day: "Ср", detections: 44, critical: 5 },
  { day: "Чт", detections: 61, critical: 8 },
  { day: "Пт", detections: 74, critical: 7 },
  { day: "Сб", detections: 46, critical: 3 },
  { day: "Вс", detections: 58, critical: 4 },
];

export type MapMarker = {
  id: string;
  severity: Severity;
  x: number;
  y: number;
  label: string;
  road: string;
};

export const mapMarkers: MapMarker[] = [
  { id: "m1", severity: "critical", x: 28, y: 34, label: "Скопление ям", road: "пр. Тауке хана · км 4.2" },
  { id: "m2", severity: "critical", x: 63, y: 61, label: "Сетка трещин", road: "ул. Жибек Жолы · км 2.7" },
  { id: "m3", severity: "high", x: 44, y: 24, label: "Продольная трещина", road: "ул. Байтурсынова · км 1.8" },
  { id: "m4", severity: "high", x: 74, y: 33, label: "Колейность обочины", road: "ул. Рыскулова · км 0.9" },
  { id: "m5", severity: "medium", x: 36, y: 66, label: "Стёртая разметка", road: "пр. Кунаева · км 3.2" },
  { id: "m6", severity: "medium", x: 55, y: 45, label: "Разрушение кромки", road: "пр. Абая · км 3.3" },
  { id: "m7", severity: "low", x: 18, y: 55, label: "Просадка люка", road: "ул. Алдиярова · км 1.1" },
  { id: "m8", severity: "low", x: 84, y: 71, label: "Износ покрытия", road: "ул. Казыбек би · км 1.2" },
  { id: "m9", severity: "high", x: 22, y: 78, label: "Яма", road: "ул. Дулати · км 6.4" },
  { id: "m10", severity: "medium", x: 68, y: 18, label: "Разрушение заплатки", road: "ул. Мадели кожа · км 2.5" },
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
  "Сегодня",
  "7 дней",
  "30 дней",
  "Квартал",
  "С начала года",
];
