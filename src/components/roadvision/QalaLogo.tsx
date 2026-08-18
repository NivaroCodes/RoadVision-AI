import { cn } from "@/lib/utils";

/**
 * Qala Vision brand mark — lime rounded square with a dark perspective-road
 * + detection-node glyph. Inline SVG so it stays crisp at any size.
 */
export function QalaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-label="Qala Vision"
      role="img"
      className={cn("size-9 shrink-0", className)}
    >
      <rect width="64" height="64" rx="15" fill="#9BEF18" />
      {/* perspective road receding to vanishing point */}
      <path d="M22 52 L29 21 L35 21 L42 52 Z" fill="#0E1114" />
      {/* lime center dashes (negative space) */}
      <line x1="32" y1="47" x2="32" y2="39" stroke="#9BEF18" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="32" y1="35" x2="32" y2="27" stroke="#9BEF18" strokeWidth="2.6" strokeLinecap="round" />
      {/* detection node at the vanishing point */}
      <circle cx="32" cy="18" r="5" fill="#0E1114" />
      <circle cx="32" cy="18" r="2.1" fill="#9BEF18" />
    </svg>
  );
}

export function QalaBrand() {
  return (
    <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
      <QalaMark />
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight text-foreground">
          Qala <span className="text-primary">Vision</span>
        </div>
        <div className="text-[10.5px] tracking-wide text-muted-foreground">
          Infrastructure Intelligence
        </div>
      </div>
    </div>
  );
}
