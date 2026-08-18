import type { ReactNode } from "react";

export function PanelHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 md:px-5">
      <div>
        <h2 className="text-[13.5px] font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {meta && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{meta}</p>}
      </div>
      {action}
    </div>
  );
}
