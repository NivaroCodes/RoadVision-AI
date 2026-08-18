import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Kpi = {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  up: boolean;
  positive: boolean;
  caption: string;
  icon: LucideIcon;
  spark: number[];
  tone: "primary" | "high" | "critical" | "low";
};

const kpis: Kpi[] = [
  {
    label: "Всего дефектов",
    value: "324",
    delta: "+8,1%",
    up: true,
    positive: false,
    caption: "за выбранный период",
    icon: AlertTriangle,
    spark: [30, 24, 32, 28, 38, 36, 44],
    tone: "primary",
  },
  {
    label: "Критические",
    value: "37",
    delta: "-4,6%",
    up: false,
    positive: true,
    caption: "11 бригад выехали",
    icon: ShieldAlert,
    spark: [40, 38, 34, 36, 30, 28, 26],
    tone: "critical",
  },
  {
    label: "В работе",
    value: "86",
    delta: "+5,2%",
    up: true,
    positive: true,
    caption: "по 24 участкам",
    icon: Wrench,
    spark: [22, 26, 30, 28, 34, 38, 40],
    tone: "high",
  },
  {
    label: "Устранено",
    value: "201",
    delta: "+12,4%",
    up: true,
    positive: true,
    caption: "точность модели 96,8%",
    icon: CheckCircle2,
    spark: [18, 26, 22, 34, 30, 42, 48],
    tone: "low",
  },
];

const toneRing: Record<Kpi["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  high: "bg-high/10 text-high",
  critical: "bg-critical/10 text-critical",
  low: "bg-low/10 text-low",
};

const toneStroke: Record<Kpi["tone"], string> = {
  primary: "stroke-primary",
  high: "stroke-high",
  critical: "stroke-critical",
  low: "stroke-low",
};

function Sparkline({ points, className }: { points: number[]; className: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 26 - ((p - min) / Math.max(1, max - min)) * 22;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-[72px]">
      <path
        d={d}
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
        className={className}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function KpiCards({
  className = "grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      {kpis.map((k) => (
        <div
          key={k.label}
          className="panel group relative overflow-hidden p-4 transition-colors hover:border-border-strong"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className={cn("grid size-8 place-items-center rounded-lg", toneRing[k.tone])}>
                <k.icon className="size-4" strokeWidth={2.1} />
              </span>
              <span className="text-[12px] font-medium text-muted-foreground">
                {k.label}
              </span>
            </div>
            <Sparkline points={k.spark} className={toneStroke[k.tone]} />
          </div>

          <div className="mt-3.5 flex items-end gap-1.5">
            <span className="num text-[28px] font-semibold leading-none tracking-tight text-foreground">
              {k.value}
            </span>
            {k.unit && (
              <span className="text-[13px] font-medium text-muted-foreground">
                {k.unit}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <span
              className={cn(
                "num inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                k.positive ? "bg-primary/12 text-primary" : "bg-critical/12 text-critical",
              )}
            >
              {k.up ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {k.delta}
            </span>
            <span className="text-[11px] text-muted-foreground">{k.caption}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
